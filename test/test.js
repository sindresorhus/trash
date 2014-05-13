'use strict';
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var trash = require('../index');

process.chdir(__dirname);

it('should trash files', function (cb) {
	fs.writeFileSync('fixture', '');
	fs.writeFileSync('fixture2', '');
	assert(fs.existsSync('fixture'));
	assert(fs.existsSync('fixture2'));

	trash(['fixture', 'fixture2'], function (err) {
		assert(!err, err);
		assert(!fs.existsSync('fixture'));
		assert(!fs.existsSync('fixture2'));
		cb();
	});
});

it('should trash a dir', function (cb) {
	var f1 = path.join('fdir', 'fixture');
	var f2 = path.join('fdir', 'fixture2');

	fs.mkdirSync('fdir');
	fs.writeFileSync(f1, '');
	fs.writeFileSync(f2, '');
	assert(fs.existsSync(f1));
	assert(fs.existsSync(f2));

	trash(['fdir'], function (err) {
		assert(!err, err);
		assert(!fs.existsSync('fdir'));
		cb();
	});
});
