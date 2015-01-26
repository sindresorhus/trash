'use strict';
module.exports = function (paths, cb) {
	if (process.platform === 'darwin') {
		require('osx-trash')(paths, cb);
		return;
	}

	if (process.platform === 'win32') {
		require('win-trash')(paths, cb);
		return;
	}

	require('xdg-trash')(paths, cb);
};
