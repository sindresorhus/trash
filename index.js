'use strict';
var path = require('path');

module.exports = function (paths) {
	if (!Array.isArray(paths)) {
		return Promise.reject(new TypeError('Expected an array'));
	}

	if (paths.length === 0) {
		return Promise.resolve();
	}

	paths = paths.map(function (el) {
		return path.resolve(String(el));
	});

	if (process.platform === 'darwin') {
		return require('./lib/osx')(paths);
	}

	if (process.platform === 'win32') {
		return require('./lib/win')(paths);
	}

	return require('xdg-trash')(paths);
};
