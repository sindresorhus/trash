'use strict';
var path = require('path');
var pathExists = require('path-exists');
var globby = require('globby');

// A resolve that does not accept variadic arguments so it can be used with map.
function resolvePath(x) {
	return path.resolve(x);
}

module.exports = function (paths) {
	if (!Array.isArray(paths)) {
		return Promise.reject(new TypeError('Expected an array'));
	}

	paths = globby.sync(paths.map(String), {nonull: true})
		.map(resolvePath)
		.filter(pathExists.sync);

	if (paths.length === 0) {
		return Promise.resolve();
	}

	switch (process.platform) {
		case 'darwin': return require('./lib/osx')(paths);
		case 'win32': return require('./lib/win')(paths);
		default: return require('./lib/linux')(paths);
	}
};
