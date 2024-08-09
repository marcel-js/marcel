let visit = require('unist-util-visit');
let retext = require('retext');

// todo plugin options
let processor = retext().use(require('retext-smartypants'), {});

module.exports = () => {
	return (ast, file) => {
		visit(ast, 'text', node => {
			node.value = String(processor.processSync(node.value));
		});
	};
};
