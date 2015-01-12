#!/usr/bin/env node
'use strict';
var updateNotifier = require('update-notifier');
var meow = require('meow');
var trash = require('./');

var cli = meow({
	help: [
		'Usage',
		'  trash [--force] <path> [<path> ...]',
		'',
		'Example',
		'  trash unicorn.png rainbow.png'
	].join('\n')
}, {
	string: ['_'],
	boolean: ['force']
});

var errExitCode = cli.flags.force ? 0 : 1;

updateNotifier({pkg: cli.pkg}).notify();

if (cli.input.length === 0) {
	console.error('You need to specify at least one path');
	process.exit(errExitCode);
}

trash(cli.input, function (err) {
	if (err) {
		console.error(err.message);
		process.exit(errExitCode);
	}
});
