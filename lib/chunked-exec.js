const {promisify} = require('util');
const {execFile} = require('child_process');

const pExecFile = promisify(execFile);

module.exports = async (binary, paths, maxPaths) => {
	// TODO: Use https://github.com/sindresorhus/chunkify when targeting Node.js 12.
	for (let group = 0; paths.length > group; group += maxPaths) {
		// eslint-disable-next-line no-await-in-loop
		await pExecFile(binary, paths.slice(group, group + maxPaths));
	}
};
