'use strict';
const path = require('path');
const pathExists = require('path-exists');
const globby = require('globby');
const macos = require('./lib/macos');
const linux = require('./lib/linux');
const win = require('./lib/win');

module.exports = iterable => {
	const paths = globby.sync(Array.from(iterable).map(String), {nonull: true})
		.map(x => path.resolve(x))
		.filter(pathExists.sync);

	if (paths.length === 0) {
		return Promise.resolve();
	}

	switch (process.platform) {
		case 'darwin': return macos(paths);
		case 'win32': return win(paths);
		default: return linux(paths);
	}
};
