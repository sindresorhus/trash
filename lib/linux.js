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

	// TODO: Use the `fs.mkdir` with `recursive` option when targeting Node.js 12.
	await makeDir(path.dirname(trashInfoPath));

	// Write the trash info file.  The filename should not exist already because
	// it is a random UUID.  If it does, we will fail with error.code == 'EEXIST'.
	// We need to create this first, because otherwise GnomeVFS will ignore it :D.
	await pWriteFile(trashInfoPath, trashInfoData, {flag: 'wx'});

	await moveFile(filePath, destination);

	return {
		path: destination,
		info: trashInfoPath
	};
};

module.exports = async paths => pMap(paths, trash, {concurrency: os.cpus().length});
