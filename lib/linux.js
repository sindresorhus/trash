'use strict';
const {promisify} = require('util');
const os = require('os');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const xdgTrashdir = require('xdg-trashdir');
const pMap = require('p-map');
const makeDir = require('make-dir');
const moveFile = require('move-file');

const pWriteFile = promisify(fs.writeFile);

const trash = async filePath => {
	const trashDirectory = await xdgTrashdir(filePath);
	const name = uuid.v4();
	const destination = path.join(trashDirectory, 'files', name);
	const trashInfoPath = path.join(trashDirectory, 'info', `${name}.trashinfo`);

	const trashInfoData = `
[Trash Info]
Path=${filePath.replace(/\s/g, '%20')}
DeletionDate=${(new Date()).toISOString()}
		`.trim();

	await Promise.all([
		moveFile(filePath, destination),
		(async () => {
			// TODO: Use the `fs.mkdir` with `recursive` option when targeting Node.js 12.
			await makeDir(path.dirname(trashInfoPath));
			await pWriteFile(trashInfoPath, trashInfoData);
		})()
	]);

	return {
		path: destination,
		info: trashInfoPath
	};
};

module.exports = paths => pMap(paths, trash, {concurrency: os.cpus().length});
