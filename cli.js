#!/usr/bin/env node
'use strict';
var updateNotifier = require('update-notifier');
var meow = require('meow');
var trash = require('./');

var cli = meow({
	help: [
		'Usage',
		'  trash <path> [<path> ...]',
		'',
		'Example',
		'  trash unicorn.png rainbow.png'
	].join('\n')
}, {
	string: ['_']
});

updateNotifier({
	packageName: cli.pkg.name,
	packageVersion: cli.pkg.version
}).notify();

trash(cli.input, function (err) {
	if (err) {
		console.error(err.message);
		process.exit(1);
	}
});
