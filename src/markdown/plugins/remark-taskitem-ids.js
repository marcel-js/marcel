let tostring = require('mdast-util-to-string');
let visit = require('unist-util-visit');
let { createHash } = require('crypto');

const id = str => {
	let hash = createHash('sha1');
	hash.update(str);
	return `task-${hash.digest('hex')}`;
};

const is_task_item = n =>
	n.type === 'listItem' && typeof n.checked === 'boolean';

module.exports = () => {
	return (ast, file) => {
		visit(ast, is_task_item, node => {
			if (!node.data) node.data = {};
			if (!node.data.hProperties) node.data.hProperties = {};
			node.data.hProperties.id = id(tostring(node));
		});
	};
};
