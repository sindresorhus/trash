'use strict';
var path = require('path');
var execFile = require('child_process').execFile;
var osxTrash = require('osx-trash');
var xdgTrash = require('xdg-trash');

function win(paths, cb) {
	execFile('./Recycle.exe', ['-f'].concat(paths), {
		cwd: path.join(__dirname, 'vendor', 'cmdutils')
	}, function (err) {
		cb(err);
	});
}

module.exports = function (paths, cb) {
	if (!Array.isArray(paths)) {
		throw new Error('`paths` required');
	}

	cb = cb || function () {};

	paths = paths.map(function (el) {
		return path.resolve(String(el));
	});

	if (process.platform === 'darwin') {
		osxTrash(paths, cb);
		return;
	}

	if (process.platform === 'win32') {
		win(paths, cb);
		return;
	}

	xdgTrash(paths, cb);
};
