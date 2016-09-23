'use strict';
const path = require('path');
const fsExtra = require('fs-extra');
const pify = require('pify');
const uuid = require('uuid');
const xdgTrashdir = require('xdg-trashdir');

const fs = pify(fsExtra);

function trash(src) {
	return xdgTrashdir(src).then(dir => {
		const name = uuid.v4();
		const dest = path.join(dir, 'files', name);
		const info = path.join(dir, 'info', `${name}.trashinfo`);
		const msg = `
[Trash Info]
Path=${src.replace(/\s/g, '%20')}
DeletionDate=${(new Date()).toISOString()}
		`.trim();

		return Promise.all([
			fs.move(src, dest, {mkdirp: true}),
			fs.outputFile(info, msg)
		]).then(() => ({
			path: dest,
			info
		}));
	});
}

module.exports = paths => Promise.all(paths.map(trash));
