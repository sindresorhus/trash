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
const {procfs} = require('@stroncium/procfs');

const lstat = promisify(fs.lstat);
const writeFile = promisify(fs.writeFile);

// Educated guess, values of 16 to 64 seem to be optimal for modern SSD, 8-16 and 64-128 can be a bit slower.
// We should be ok as long as ssdCount <= cpuCount <= ssdCount*16.
// For slower media this is not as important and we rely on OS handling it for us.
const concurrency = os.cpus().length * 8;

const pad = number => number < 10 ? '0' + number : number;

const getDeletionDate = date => date.getFullYear() +
	'-' + pad(date.getMonth() + 1) +
	'-' + pad(date.getDate()) +
	'T' + pad(date.getHours()) +
	':' + pad(date.getMinutes()) +
	':' + pad(date.getSeconds());

const trash = async (filePath, trashPaths) => {
	const name = uuid.v4();
	const destination = path.join(trashPaths.filesPath, name);
	const trashInfoPath = path.join(trashPaths.infoPath, `${name}.trashinfo`);

	const trashInfoData = `[Trash Info]\nPath=${filePath.replace(/\s/g, '%20')}\nDeletionDate=${getDeletionDate(new Date())}`;

	await writeFile(trashInfoPath, trashInfoData);
	await moveFile(filePath, destination);

	return {
		path: destination,
		info: trashInfoPath
	};
};

module.exports = async paths => {
	const mountPointMap = new Map(procfs.processMountinfo().map(info => [info.devId, info.mountPoint]));
	const trashPathsCache = new Map();

	const getDeviceTrashPaths = async devId => {
		let trashPathsPromise = trashPathsCache.get(devId);
		if (trashPathsPromise === undefined) {
			trashPathsPromise = (async () => {
				const trashPath = await xdgTrashdir(mountPointMap.get(devId));
				const paths = {
					filesPath: path.join(trashPath, 'files'),
					infoPath: path.join(trashPath, 'info')
				};
				// TODO: Use the `fs.mkdir` with `recursive` option when targeting Node.js 12.
				await makeDir(paths.filesPath, {mode: 0o700});
				await makeDir(paths.infoPath, {mode: 0o700});
				return paths;
			})();
			trashPathsCache.set(devId, trashPathsPromise);
		}

		return trashPathsPromise;
	};

	return pMap(paths, async filePath => {
		const stats = await lstat(filePath);
		const trashPaths = await getDeviceTrashPaths(stats.dev);
		return trash(filePath, trashPaths);
	}, {concurrency});
};
