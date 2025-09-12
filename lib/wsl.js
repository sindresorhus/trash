import {Buffer} from 'node:buffer';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import chunkify from '@sindresorhus/chunkify';

const execFilePromise = promisify(execFile);

// TODO: I plan to move these to wsl-extras at some point.

/**
Convert WSL paths to Windows paths using `wslpath`.

@param {string[]} paths - Array of WSL/Linux paths..
@returns {Promise<string[]>} Array of Windows paths.
*/
async function wslPathToWindows(paths) {
	try {
		const {stdout} = await execFilePromise('wslpath', ['-w', '-a', ...paths]);
		return stdout.split(/\r?\n/).filter(Boolean);
	} catch (error) {
		error.message = `Failed to convert paths with "wslpath": ${error.message}`;
		throw error;
	}
}

/**
Check if a Windows path is a UNC path (\\wsl$\...).

@param {string} path - Windows path to check.
@returns {boolean} True if path is UNC.
*/
function isUncPath(path) {
	return /^\\\\/u.test(path);
}

/**
Partition paths into local Windows paths and UNC WSL paths.

@param {string[]} windowsPaths - Array of Windows paths.
@param {string[]} originalPaths - Corresponding original Linux paths.g
@returns {{localPaths: string[], uncPaths: string[]}} Partitioned paths.
*/
function partitionWindowsPaths(windowsPaths, originalPaths) {
	const localPaths = [];
	const uncPaths = [];

	for (const [index, windowsPath] of windowsPaths.entries()) {
		if (isUncPath(windowsPath)) {
			uncPaths.push(originalPaths[index]);
		} else {
			localPaths.push(windowsPath);
		}
	}

	return {localPaths, uncPaths};
}

/**
Execute a PowerShell script using -EncodedCommand for safety.

@param {string} script - PowerShell script to execute.
@returns {Promise<{stdout: string, stderr: string}>} Execution result.
*/
async function executePowerShellScript(script) {
	const encodedCommand = Buffer.from(script, 'utf16le').toString('base64');
	return execFilePromise('powershell.exe', [
		'-NoProfile',
		'-NonInteractive',
		'-ExecutionPolicy',
		'Bypass',
		'-EncodedCommand',
		encodedCommand,
	]);
}

/**
Check if WSL interop is enabled by testing PowerShell availability.

@returns {Promise<boolean>} True if interop is enabled
*/
async function isWslInteropEnabled() {
	try {
		await execFilePromise('powershell.exe', [
			'-NoProfile',
			'-NonInteractive',
			'-Command',
			'$PSVersionTable.PSVersion',
		]);
		return true;
	} catch (error) {
		if (error.code === 'ENOENT') {
			return false;
		}

		throw error;
	}
}

/**
WSL implementation:
- Converts WSL paths to Windows paths with `wslpath -w -a`
- For Windows-local paths (e.g., `C:\…`), uses PowerShell to send to Recycle Bin
- For UNC `\\wsl$\…` paths (Linux filesystem), falls back to the Linux trash implementation
- Processes inputs in chunks to avoid command-line length limits
- Uses `-LiteralPath` to avoid wildcard expansion
- Uses `-EncodedCommand` with UTF-16LE to avoid quoting/length issues
*/
export default async function wsl(paths) {
	// Check interop availability once
	const interopEnabled = await isWslInteropEnabled();
	if (!interopEnabled) {
		const error = new Error('WSL interop is disabled. Enable it or use Linux trash implementation.');
		error.code = 'WSL_INTEROP_DISABLED';
		throw error;
	}

	for (const chunk of chunkify(paths, 400)) {
		// Resolve to Windows paths
		// eslint-disable-next-line no-await-in-loop
		const windowsPathsRaw = await wslPathToWindows(chunk);

		// Partition into local drive paths and UNC \\wsl$ paths
		const {localPaths: localWindowsPaths, uncPaths: uncLinuxPaths} = partitionWindowsPaths(windowsPathsRaw, chunk);

		// Fallback to Linux trash for files that live on the Linux filesystem (UNC \\wsl$)
		if (uncLinuxPaths.length > 0) {
			// eslint-disable-next-line no-await-in-loop
			const {default: linuxTrash} = await import('./linux.js');
			// eslint-disable-next-line no-await-in-loop
			await linuxTrash(uncLinuxPaths);
		}

		// Nothing to recycle on Windows side for this chunk
		if (localWindowsPaths.length === 0) {
			continue;
		}

		// Build a PowerShell script that:
		// - Decodes a Base64 JSON array of paths
		// - Uses LiteralPath to avoid wildcard expansion
		// - Sends files/dirs to Recycle Bin
		const json = JSON.stringify(localWindowsPaths);
		const base64Json = Buffer.from(json, 'utf8').toString('base64');

		const psScript = `
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName Microsoft.VisualBasic
$paths = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${base64Json}')) | ConvertFrom-Json
foreach ($p in $paths) {
	if (Test-Path -LiteralPath $p) {
		if (Test-Path -LiteralPath $p -PathType Container) {
			[Microsoft.VisualBasic.FileIO.FileSystem]::DeleteDirectory($p, 'OnlyErrorDialogs', 'SendToRecycleBin')
		} else {
			[Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile($p, 'OnlyErrorDialogs', 'SendToRecycleBin')
		}
	}
}
`.trim();

		// Execute PowerShell
		// eslint-disable-next-line no-await-in-loop
		await executePowerShellScript(psScript);
	}
}
