/*
	Load Marcel configuration file
 */

const fs = require('fs');
const path = require('path');
const deepmerge = require('deepmerge');

const default_config = require('./default.config.js');

const CONFIG_FILE_DEFAULT_PATH = 'marcel.config.js';

module.exports = async () => {
	if (fs.existsSync(CONFIG_FILE_DEFAULT_PATH)) {
		let user_config = require(path.join(
			process.cwd(),
			CONFIG_FILE_DEFAULT_PATH
		));
		let cfg =
			typeof user_config === 'function'
				? await user_config()
				: user_config;
		return deepmerge(default_config, cfg);
	} else {
		return default_config;
	}
};
