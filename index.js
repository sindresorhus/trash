'use strict';
const fs = require('fs');
const path = require('path');
const globby = require('globby');
const pTry = require('p-try');
const isPathInside = require('is-path-inside');
const macos = require('./lib/macos');
const linux = require('./lib/linux');
const windows = require('./lib/windows');

const trash = (paths, options) => pTry(() => {
	paths = (typeof paths === 'string' ? [paths] : paths).map(String);

	options = {
		glob: true,
		...options
	};

	// TOOD: Upgrading to latest `globby` version is blocked by https://github.com/mrmlnc/fast-glob/issues/110
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
			return macos(paths);
		case 'win32':
			return windows(paths);
		default:
			return linux(paths);
	}
});

module.exports = trash;
