'use strict';
const fs = require('fs');
const path = require('path');
const globby = require('globby');
const isPathInside = require('is-path-inside');
const macos = require('./lib/macos');
const linux = require('./lib/linux');
const windows = require('./lib/windows');

const trash = async (paths, options) => {
	paths = (typeof paths === 'string' ? [paths] : paths).map(path => String(path));

	options = {
		glob: true,
		...options
	};

	// TODO: Upgrading to latest `globby` version is blocked by https://github.com/mrmlnc/fast-glob/issues/110
	if (options.glob) {
		paths = await globby(paths, {
			expandDirectories: false,
			nodir: false,
			nonull: true
		});
	}
	
	paths = await Promise.all(paths.map(async filePath => {		
		if (paths.some(otherPath => isPathInside(filePath, otherPath))) {
			return;
		}

		try {
			await fs.promise.lstat(filePath);
		} catch (error) {
			if (error.code === 'ENOENT') {
				return;
			}

			throw error;
		}

		return path.resolve(filePath);
	}));
	
	paths = paths.filter(isPath => isPath);

	if (paths.length === 0) {
		return;
	}

	switch (process.platform) {
		case 'darwin':
			return macos(paths);
		case 'win32':
			return windows(paths);
		default:
			return linux(paths);
	}
};

module.exports = trash;
