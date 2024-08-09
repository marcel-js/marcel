/*
	Unified plugin that generates a plain-text version
	of the content and places it in `file.data.plaintext`.
 */

const unified = require('unified');
const extend = require('extend');

let processor = unified()
	.use(require('strip-markdown'))
	.use(require('remark-stringify'));

module.exports = () => {
	return (ast, file) => {
		// Make a deep copy of the AST
		// so we don't alter it
		let copy = extend(true, {}, ast);
		let res = processor.stringify(processor.runSync(copy));

		// Trim any newlines at the beginning/end of the text.
		file.data.plaintext = res.replace(/^\n*|\n*$/, '');
	};
};
