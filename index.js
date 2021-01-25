'use strict';
const fs = require('fs');
const path = require('path');
const globby = require('globby');
const isPathInside = require('is-path-inside');

const trash = async (paths, options) => {
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

	let trash;
	if (process.platform === 'darwin') {
		trash = require('./lib/macos');
	} else if (process.platform === 'win32') {
		trash = require('./lib/windows');
	} else {
		trash = require('./lib/linux');
	}

	return trash(paths);
};

module.exports = trash;
