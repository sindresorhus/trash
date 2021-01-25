'use strict';
const fs = require('fs');
const path = require('path');
const globby = require('globby');
const pTry = require('p-try');
const isPathInside = require('is-path-inside');

const trash = (paths, options) => pTry(() => {
	paths = (typeof paths === 'string' ? [paths] : paths).map(path => String(path));

	options = {
		glob: true,
		...options
	};

	// TODO: Upgrading to latest `globby` version is blocked by https://github.com/mrmlnc/fast-glob/issues/110
	if (options.glob) {
		paths = globby.sync(paths, {
			expandDirectories: false,
			nodir: false,
			nonull: true
		});
	}

	paths = paths.map(filePath => path.resolve(filePath));

	paths = paths.filter(filePath => {
		if (paths.some(otherPath => isPathInside(filePath, otherPath))) {
			return false;
		}

		try {
			return fs.lstatSync(filePath);
		} catch (error) {
			if (error.code === 'ENOENT') {
				return false;
			}

			throw error;
		}
	});

	if (paths.length === 0) {
		return;
	}

	switch (process.platform) {
		case 'darwin':
			const macos = require('./lib/macos');
			return macos(paths);
		case 'win32':
			const windows = require('./lib/windows');
			return windows(paths);
		default:
			const linux = require('./lib/linux');
			return linux(paths);
	}
});

module.exports = trash;
