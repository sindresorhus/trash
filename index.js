'use strict';
const fs = require('fs');
const path = require('path');
const globby = require('globby');
const pTry = require('p-try');
const macos = require('./lib/macos');
const linux = require('./lib/linux');
const windows = require('./lib/windows');

module.exports = (paths, options) => pTry(() => {
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

	paths = paths
		.map(filePath => path.resolve(filePath))
		.filter(filePath => {
			try {
				return fs.lstatSync(filePath);
			} catch (error) {
				if (error.code === 'ENOENT') {
					return false;
				}

				throw error;
			}
		})
		.sort((a, b) => b.split(path.sep).length - a.split(path.sep).length);

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
