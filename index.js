'use strict';
const fs = require('fs');
const path = require('path');
const globby = require('globby');
const macos = require('./lib/macos');
const linux = require('./lib/linux');
const win = require('./lib/win');

module.exports = (iterable, opts) => {
	iterable = Array.from(typeof iterable === 'string' ? [iterable] : iterable).map(String);
	opts = Object.assign({glob: true}, opts);

	const paths = (opts.glob === false ? iterable : globby.sync(iterable, {
		expandDirectories: false,
		nodir: false,
		nonull: true
	}))
		.map(x => path.resolve(x))
		.filter(x => {
			try {
				return fs.lstatSync(x);
			} catch (err) {
				if (err.code === 'ENOENT') {
					return false;
				}

				return Promise.reject(err);
			}
		});

	if (paths.length === 0) {
		return Promise.resolve();
	}

	switch (process.platform) {
		case 'darwin': return macos(paths);
		case 'win32': return win(paths);
		default: return linux(paths);
	}
};
