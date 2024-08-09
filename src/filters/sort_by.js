const getPath = require('../util/get-path');

module.exports = function(collection, propPath) {
	return collection
		.slice()
		.sort((a, b) => getPath(a, propPath) - getPath(b, propPath));
};
