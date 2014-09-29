'use strict';
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var trash = require('../');

process.chdir(__dirname);

it('should trash files', function (cb) {
	var weirdName = process.platform === 'darwin' ? 'weird\\\\name\\"\'' : 'fixture3';

	fs.writeFileSync('fixture', '');
	fs.writeFileSync('fixture2', '');
	fs.writeFileSync(weirdName, '');
	fs.writeFileSync('123');
	assert(fs.existsSync('fixture'));
	assert(fs.existsSync('fixture2'));
	assert(fs.existsSync(weirdName));
	assert(fs.existsSync('123'));

	trash([
		'fixture',
		'fixture2',
		weirdName,
		123
	], function (err) {
		assert(!err, err);
		assert(!fs.existsSync('fixture'));
		assert(!fs.existsSync('fixture2'));
		assert(!fs.existsSync(weirdName));
		assert(!fs.existsSync('123'));
		cb();
	});
});

it('should trash a dir', function (cb) {
	var d1f1 = path.join('fdir', 'fixture');
	var d1f2 = path.join('fdir', 'fixture2');
	var d2f1 = path.join('321', 'fixture');
	var d2f2 = path.join('321', 'fixture2');

	fs.mkdirSync('fdir');
	fs.writeFileSync(d1f1, '');
	fs.writeFileSync(d1f2, '');
	assert(fs.existsSync(d1f1));
	assert(fs.existsSync(d1f2));

	fs.mkdirSync('321');
	fs.writeFileSync(d2f1, '');
	fs.writeFileSync(d2f2, '');
	assert(fs.existsSync(d2f1));
	assert(fs.existsSync(d2f2));

	trash([
		'fdir',
		321
	], function (err) {
		assert(!err, err);
		assert(!fs.existsSync('fdir'));
		assert(!fs.existsSync(321));
		cb();
	});
});
