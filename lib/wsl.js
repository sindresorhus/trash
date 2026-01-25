import {Buffer} from 'node:buffer';
import chunkify from 'chunkify';
import {canAccessPowerShell, convertWslPathToWindows, isUncPath} from 'wsl-utils';
import {executePowerShell} from 'powershell-utils';

/**
WSL implementation:
- Converts WSL paths to Windows paths
- For Windows-local paths (e.g., `C:\…`), uses PowerShell to send to Recycle Bin
- For UNC `\\wsl$\…` paths (Linux filesystem), falls back to the Linux trash implementation
- Processes inputs in chunks to avoid command-line length limits
- Uses `-LiteralPath` to avoid wildcard expansion
- Uses `-EncodedCommand` with UTF-16LE to avoid quoting/length issues
*/
export default async function wsl(paths) {
	const interopEnabled = await canAccessPowerShell();
	if (!interopEnabled) {
		const error = new Error('WSL interop is disabled. Enable it or use Linux trash implementation.');
		error.code = 'WSL_INTEROP_DISABLED';
		throw error;
	}

	let linuxTrash;

	for (const chunk of chunkify(paths, 400)) {
		// eslint-disable-next-line no-await-in-loop
		const windowsPaths = await convertWslPathToWindows(chunk);

		// Partition into local drive paths and UNC \\wsl$ paths
		const localWindowsPaths = [];
		const uncLinuxPaths = [];

		for (const [index, windowsPath] of windowsPaths.entries()) {
			if (isUncPath(windowsPath)) {
				uncLinuxPaths.push(chunk[index]);
			} else {
				localWindowsPaths.push(windowsPath);
			}
		}

		// Fallback to Linux trash for files that live on the Linux filesystem (UNC \\wsl$)
		if (uncLinuxPaths.length > 0) {
			if (!linuxTrash) {
				// eslint-disable-next-line no-await-in-loop
				const {default: linuxTrashImport} = await import('./linux.js');
				linuxTrash = linuxTrashImport;
			}

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

		// eslint-disable-next-line no-await-in-loop
		await executePowerShell(psScript);
	}
}
