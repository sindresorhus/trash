import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
import xdgTrashdir from 'xdg-trashdir';
import pMap from 'p-map';
import {moveFile} from 'move-file';
import {procfs} from '@stroncium/procfs';

// Educated guess, values of 16 to 64 seem to be optimal for modern SSD, 8-16 and 64-128 can be a bit slower.
// We should be ok as long as ssdCount <= cpuCount <= ssdCount*16.
// For slower media this is not as important and we rely on OS handling it for us.
const concurrency = os.cpus().length * 8;

const pad = number => number < 10 ? '0' + number : number;

const getDeletionDate = date => date.getFullYear()
	+ '-' + pad(date.getMonth() + 1)
	+ '-' + pad(date.getDate())
	+ 'T' + pad(date.getHours())
	+ ':' + pad(date.getMinutes())
	+ ':' + pad(date.getSeconds());

const trash = async (filePath, trashPaths) => {
	const name = randomUUID();
	const destination = path.join(trashPaths.filesPath, name);
	const trashInfoPath = path.join(trashPaths.infoPath, `${name}.trashinfo`);

	const trashInfoData = `[Trash Info]\nPath=${filePath.replaceAll(/\s/g, '%20')}\nDeletionDate=${getDeletionDate(new Date())}`;

	await fs.promises.writeFile(trashInfoPath, trashInfoData);
	await moveFile(filePath, destination);

	return {
		path: destination,
		info: trashInfoPath,
	};
};

export default async function linux(paths) {
	const mountPointMap = new Map();

	for (const mountInfo of Object.values(procfs.processMountinfo())) {
		// Filter out irrelevant drives (that start with `/snap`, `/run`, etc).
		if (/^\/(snap|var\/snap|run|sys|proc|dev)($|\/)/.test(mountInfo.mountPoint)) {
			continue;
		}

		// Keep the first one if there are multiple `devId`.
		if (!mountPointMap.has(mountInfo.devId)) {
			mountPointMap.set(mountInfo.devId, mountInfo.mountPoint);
		}
	}

	const trashPathsCache = new Map();

	const getDeviceTrashPaths = async developmentId => {
		let trashPathsPromise = trashPathsCache.get(developmentId);
		if (trashPathsPromise === undefined) {
			trashPathsPromise = (async () => {
				const trashPath = await xdgTrashdir(mountPointMap.get(developmentId));
				const paths = {
					filesPath: path.join(trashPath, 'files'),
					infoPath: path.join(trashPath, 'info'),
				};
				await fs.promises.mkdir(paths.filesPath, {mode: 0o700, recursive: true});
				await fs.promises.mkdir(paths.infoPath, {mode: 0o700, recursive: true});
				return paths;
			})();
			trashPathsCache.set(developmentId, trashPathsPromise);
		}

		return trashPathsPromise;
	};

	return pMap(paths, async filePath => {
		const stats = await fs.promises.lstat(filePath);
		const trashPaths = await getDeviceTrashPaths(stats.dev);
		return trash(filePath, trashPaths);
	}, {concurrency});
}
