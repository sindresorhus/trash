import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {globby} from 'globby';
import isPathInside from 'is-path-inside';

export default async function trash(paths, options = {}) {
	paths = [paths].flat().map(String);

	const {glob = true} = options;

	if (glob) {
		// Normalize '/**' patterns to their base directory
		const patterns = paths.map(pattern => {
			const isNegated = pattern.startsWith('!');
			const body = isNegated ? pattern.slice(1) : pattern;
			const normalized = body.endsWith('/**') ? path.dirname(body) : body;
			return isNegated ? '!' + normalized : normalized;
		});

		const matches = await globby(patterns, {
			expandDirectories: false,
			onlyFiles: false,
			followSymbolicLinks: false,
		});

		// Include literal paths that exist
		const literals = await Promise.all(paths.map(async p => {
			try {
				await fs.promises.lstat(p);
				return p;
			} catch {
				return null;
			}
		}));

		paths = [...new Set([...matches, ...literals.filter(Boolean)])];
	}

	// Filter out nested paths and resolve
	const pathChecks = await Promise.all(paths.map(async filePath => {
		// Skip if nested in another path
		if (paths.some(p => p !== filePath && isPathInside(filePath, p))) {
			return;
		}

		try {
			await fs.promises.lstat(filePath);
			return path.resolve(filePath);
		} catch (error) {
			// Ignore non-existent paths
			if (error.code !== 'ENOENT') {
				throw error;
			}
		}
	}));

	const resolvedPaths = pathChecks.filter(Boolean);

	if (resolvedPaths.length === 0) {
		return;
	}

	// Load platform-specific implementation
	const platform = process.platform === 'darwin'
		? 'macos'
		: (process.platform === 'win32' ? 'windows' : 'linux');

	const {default: trashFunction} = await import(`./lib/${platform}.js`);
	return trashFunction(resolvedPaths);
}
