const { join } = require('path');

module.exports = (path, pretty = true) => {
	if (path.match(/\.html$/)) return path;
	if (pretty) {
		return join(path, 'index.html');
	}
	return `${path === '/' ? 'index' : path}.html`;
};
