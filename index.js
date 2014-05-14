'use strict';
var path = require('path');
var execFile = require('child_process').execFile;
var escapeStringApplescript = require('escape-string-applescript');

function osx(paths, cb) {
	var script = '' +
		'set deleteList to {}\n' +
		'repeat with currentPath in ' + '{' + paths.map(function (el) {
			return '"' + escapeStringApplescript(el) + '"';
		}).join(',') + '}' + '\n' +
		'set end of deleteList to POSIX file currentPath\n' +
		'end repeat\n' +
		'tell app "Finder" to delete deleteList';

	execFile('osascript', ['-e', script], function (err) {
		if (err && /10010/.test(err.message)) {
			return cb(new Error('Item doesn\'t exist'));
		}

		cb(err);
	});
};

function linux(paths, cb) {
	execFile('./trash-put', paths, {
		cwd: path.join(__dirname, 'vendor')
	}, function (err) {
		if (err && /cannot trash non existent/.test(err.message)) {
			return cb(new Error('Item doesn\'t exist'));
		}

		cb(err);
	});
};

function win(paths, cb) {
	execFile('./Recycle.exe', ['-f'].concat(paths), {
		cwd: path.join(__dirname, 'vendor', 'cmdutils')
	}, function (err) {
		cb(err);
	});
};

module.exports = function (paths, cb) {
	if (!Array.isArray(paths)) {
		throw new Error('`paths` required');
	}

	cb = cb || function () {};
	paths = paths.map(function (el) { return path.resolve(el) });

	if (process.platform === 'darwin') {
		osx(paths, cb);
		return;
	}

	if (process.platform === 'win32') {
		win(paths, cb);
		return;
	}

	linux(paths, cb);
};
