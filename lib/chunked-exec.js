const {promisify} = require('util');
const {execFile} = require('child_process');

const pExecFile = promisify(execFile);

const maxPaths = 200;

module.exports = async (binary, paths) => {
	for (let group = 0; paths.length > group; group += maxPaths) {
		// eslint-disable-next-line no-await-in-loop
		await pExecFile(binary, paths.slice(group, group + maxPaths));
	}
};
