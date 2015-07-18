#!/usr/bin/env node
'use strict';
var updateNotifier = require('update-notifier');
var meow = require('meow');
var eachAsync = require('each-async');
var pathExists = require('path-exists');
var trash = require('./');

var cli = meow({
	help: [
		'Usage',
		'  $ trash [--force] <path> [<path> ...]',
		'',
		'Example',
		'  $ trash unicorn.png rainbow.png'
	]
}, {
	string: ['_'],
	boolean: ['force']
});

var errExitCode = cli.flags.force ? 0 : 1;
var files = [];

updateNotifier({pkg: cli.pkg}).notify();

if (cli.input.length === 0) {
	console.error('You need to specify at least one path');
	process.exit(errExitCode);
}

eachAsync(cli.input, function (el, i, cb) {
	pathExists(el, function (err, exists) {
		if (err) {
			cb(err);
			return;
		}

		if (exists) {
			files.push(el);
		}

		cb();
	});
}, function (err) {
	if (err) {
		console.error(err.message);
		process.exit(errExitCode);
	}

	trash(files, function (err) {
		if (err) {
			console.error(err.message);
			process.exit(errExitCode);
		}
	});
});
