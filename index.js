'use strict';
var path = require('path');
var pathExists = require('path-exists');
var globby = require('globby');
var macos = require('./lib/macos');
var linux = require('./lib/linux');
var win = require('./lib/win');

module.exports = function (paths) {
	if (!Array.isArray(paths)) {
		return Promise.reject(new TypeError('Expected an array'));
	}

	paths = globby.sync(paths.map(String), {nonull: true})
		.map(function (x) {
			return path.resolve(x);
		})
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
