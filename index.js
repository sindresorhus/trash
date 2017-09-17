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

	const paths = (opts.glob === false ? iterable : globby.sync(iterable, {nonull: true}))
		.map(x => path.resolve(x))
		.filter(fs.existsSync);

	if (paths.length === 0) {
		return Promise.resolve();
	}

	switch (process.platform) {
		case 'darwin': return macos(paths);
		case 'win32': return win(paths);
		default: return linux(paths);
	}
};
