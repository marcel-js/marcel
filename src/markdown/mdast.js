const unified = require('unified');
const frontmatter = require('./plugins/remark-extract-frontmatter');
const smartypants = require('./plugins/remark-smartypants');
const taskitem_ids = require('./plugins/remark-taskitem-ids');

module.exports = options => {
	let processor = unified()
		.use(require('remark-parse'))
		.use(frontmatter);

	if (options.smartypants) {
		processor = processor.use(
			smartypants,
			options.smartypants === true ? {} : options.smartypants
		);
	}

	if (options.taskids) {
		processor = processor.use(
			taskitem_ids,
			options.taskids === true ? {} : options.taskids
		);
	}

	return file => processor.run(processor.parse(file), file);
};
