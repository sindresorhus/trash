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
			// eslint-disable-next-line node/no-unsupported-features/node-builtins -- It's Node 10.1+
			await fs.promises.lstat(filePath);
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

	let trash;
	if (process.platform === 'darwin') {
		trash = require('./lib/macos.js');
	} else if (process.platform === 'win32') {
		trash = require('./lib/windows.js');
	} else {
		trash = require('./lib/linux.js');
	}

	return trash(paths);
};

module.exports = trash;
