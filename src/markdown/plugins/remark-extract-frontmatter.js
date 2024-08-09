const find = require('unist-util-find');

/*
	An Unified preset for extracting 
	the post's YAML/TOML/JSON frontmatter
	into the file's `data.frontmatter`
 */

const FORMATS = [
	{
		type: 'yaml',
		marker: '-',
		parse: require('js-yaml').safeLoad
	},
	{
		type: 'toml',
		marker: '+',
		parse: require('toml').parse
	},
	{
		type: 'json_fm',
		fence: {
			open: '{',
			close: '}'
		},
		parse: val => JSON.parse(`{${val}}`)
	}
];

const TYPES = Object.fromEntries(FORMATS.map(fmt => [fmt.type, fmt]));

module.exports = [
	[require('remark-frontmatter'), FORMATS],
	() => (ast, file) => {
		let node = find(ast, n => TYPES[n.type]);
		if (node) {
			file.data.frontmatter = {
				...file.data.frontmatter,
				...TYPES[node.type].parse(node.value)
			};
		}
	}
];
