const path = require('path');

module.exports = async file => {
	let module = require(path.resolve(file.cwd, file.path));
	return typeof module === 'function' ? await module() : module;
};
