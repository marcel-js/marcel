const unified = require('unified');

module.exports = options => {
	let processor = unified().use(require('rehype-stringify'));
	return processor.stringify;
};
