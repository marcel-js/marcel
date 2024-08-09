module.exports = {
	contentDir: 'content',
	dataDir: 'data',
	templateDir: 'templates',
	staticDir: 'static',
	distDir: 'dist',
	filters: {
		format_date: require('./filters/format_date'),
		sort_by: require('./filters/sort_by')
	},
	data: {},
	base: '/',
	templateExt: 'html',
	lists: [
		{
			from: 'section',
			include_index: false,
			include_undefined: false
		},
		{
			from: 'tags',
			default_value: 'untagged',
			include_index: true,
			include_undefined: false
		}
	],
	plugins: [],
	permalinks: {
		pretty: true,
		single: (post, config) => {},
		list: (post, config) => {}
	},
	markdown: {
		smartypants: true,
		headerlinks: true,
		highlight: {
			ignoreMissing: true
		},
		taskids: true
	},
	tags: {},
	experimental: {
		embedtag: false
	}
};
