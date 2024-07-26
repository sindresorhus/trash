import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import globby from 'globby';
import isPathInside from 'is-path-inside';

export default async function trash(paths, options) {
	paths = [paths].flat().map(String);

	options = {
		glob: true,
		...options,
	};

	// TODO: Upgrading to latest `globby` version is blocked by https://github.com/mrmlnc/fast-glob/issues/110
	if (options.glob) {
		paths = await globby(paths, {
			expandDirectories: false,
			nodir: false,
			nonull: true,
		});
	}

	paths = await Promise.all(paths.map(async filePath => {
		if (paths.some(otherPath => isPathInside(filePath, otherPath))) {
			return;
		}

		try {
			await fs.promises.lstat(filePath);
		} catch (error) {
			if (error.code === 'ENOENT') {
				return;
			}

			throw error;
		}

		return path.resolve(filePath);
	}));

	paths = paths.filter(Boolean);

	if (paths.length === 0) {
		return;
	}

	let module;
	if (process.platform === 'darwin') {
		module = await import('./lib/macos.js');
	} else if (process.platform === 'win32') {
		module = await import('./lib/windows.js');
	} else {
		module = await import('./lib/linux.js');
	}

	return module.default(paths);
}
