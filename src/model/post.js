const { stat, exists, readFile } = require('fs-extra');
const { resolve, join, sep, normalize } = require('path');
const { parse } = require('url');
const { promisify } = require('util');
const vfile = require('to-vfile');
const slugify = require('@sindresorhus/slugify');
const visit = require('unist-util-visit');

const strip_filename_prefix = require('../util/strip-filename-prefix');

/*
	A map of all content files, useful for
	resolving relative links in markdown files
	to their appropriate permalink.
 */
const __posts__ = new Map();

class Post {
	constructor(attrs, options) {
		Object.assign(this, attrs);
		this.options = {
			...options
		};
	}

	/*
		Load a file path into a VFile,
		and augment its data with:
		* frontmatter defined in an external file
		* file statistics (creation date, etc.)
	 */
	async load(path) {
		let file = await vfile.read({ path, cwd: this.options.cwd }, 'utf8');

		file.data.frontmatter = {};

		// Load frontmatter from external file
		let fm_path = resolve(this.options.cwd, this.options.frontmatter_path);
		if (await exists(fm_path)) {
			file.data.frontmatter = JSON.parse(await readFile(fm_path, 'utf8'));
		}

		// Load file stats
		let stats = await stat(resolve(file.cwd, file.path));
		file.data.stats = {
			date: new Date(stats.birthtimeMs),
			updated: new Date(stats.mtimeMs)
		};

		this.file = file;

		__posts__.set(this.file.path, this);
	}

	async execute(renderer, context) {
		if (!this.file) {
			throw new Error('File has not been loaded');
		}
		let render = promisify(renderer.renderString.bind(renderer));
		this.file.contents = await render(this.file.contents, context);
	}

	async parse(parser) {
		if (!this.file) {
			throw new Error('File has not been loaded');
		}
		this.file.__ast__ = await parser(this.file);
	}

	async transform(transformer) {
		if (!this.file.__ast__) {
			throw new Error('File has not been parsed');
		}
		this.file.__ast__ = await transformer(this.file.__ast__, this.file);
	}

	async compile(compiler) {
		if (!this.file.__ast__) {
			throw new Error('File has not been parsed');
		}
		this.file.contents = await compiler(this.file.__ast__, this.file);
	}

	apply_permalinks() {
		if (!this.file.__ast__) {
			throw new Error('File has not been parsed');
		}

		visit(this.file.__ast__, node => {
			if (node.tagName === 'a') {
				/*
					Note: The WHATWG-compliant URL parser
					that's invoked with new URL() can't currently
					handle relative URLs, and it's hard to solve
					this comprehensively. For now, we rely on
					url.parse(), with the caveat that it may be
					deprecated in the future.
					See: https://github.com/nodejs/node/issues/12682
				 */
				let url = parse(node.properties.href);
				if (url.protocol === null && url.pathname) {
					let link = join(this.file.dirname, url.pathname);
					let destination = this.constructor.for(link);
					if (destination && destination.permalink !== false) {
						let { permalink } = destination;
						if (url.query) permalink += '?' + url.query;
						if (url.hash) permalink += url.hash;
						node.properties.href = permalink;
					}
				}
			}
		});
	}

	/*
		Property getters
		----------------
	 */

	get stats() {
		return this.file.data.stats;
	}

	get frontmatter() {
		return this.file.data.frontmatter;
	}

	get title() {
		return this.frontmatter.title;
	}

	get content() {
		return this.file.contents;
	}

	get date() {
		return this.frontmatter.date || this.stats.date;
	}

	get updated() {
		return this.frontmatter.updated || this.stats.updated;
	}

	get type() {
		return this.frontmatter.type;
	}

	get section() {
		let section = this.file.dirname.split(sep)[0];
		return section === '.' ? '__undefined__' : section;
	}

	get slug() {
		return this.frontmatter.slug;
	}

	get title_slug() {
		if (this.frontmatter.title) {
			return slugify(this.frontmatter.title);
		}
		return undefined;
	}

	get filename_slug() {
		return (
			slugify(strip_filename_prefix(this.file.stem)) ||
			slugify(this.file.stem)
		);
	}

	/*
		This setup allows the user-supplied permalink
		function to return `false` to stop a Post from rendering
		or not return anything to fall back to the default permalink.

		__permalink() does not have config.base prepended,
		we only use it to write the files on disk.
	 */
	get __permalink() {
		// Explicit permalink in front matter
		if (this.frontmatter.permalink !== undefined) {
			return this.frontmatter.permalink;
		}
		let custom = this.constructor.Permalink
			? this.constructor.Permalink(this)
			: undefined;
		return normalize(
			custom !== undefined
				? custom
				: this.constructor.DefaultPermalink(this)
		);
	}

	/*
		The public permalink
	 */
	get permalink() {
		return this.options.finalizer(this.__permalink);
	}

	get draft() {
		return this.frontmatter.draft;
	}

	get template() {
		return this.frontmatter.template;
	}

	get templates() {
		return this.constructor.DefaultHierarchy(this);
	}
}

/*
	Static properties
	-----------------
 */

/*
	Returns the Post object for a particular path
	relative to the contentDir. 
 */
Post.for = path => __posts__.get(path);

/*
	The user-supplied permalink function 
	will be injected here.
 */
Post.Permalink = null;

/*
	The default permalink function for Post objects.
 */
Post.DefaultPermalink = post => {
	let link = post.slug || post.filename_slug || post.title_slug;
	return post.file.dirname === '.'
		? `/${link}`
		: `/${post.file.dirname}/${link}`;
};

/*
	The default template hierarchy for Post objects,
	from most specific to least specific:

	- explicit `template` in frontmatter
	- single-$section-$type.html
	- single-$type.html
	- single-$section.html
	- single.html
	- index.html
 */
Post.DefaultHierarchy = post => {
	let templates = [];

	if (post.template) {
		templates.push(post.template);
	}

	if (post.type) {
		if (post.section && post.section !== '__undefined__') {
			templates.push(`single-${post.section}-${post.type}`);
		}
		templates.push(`single-${post.type}`);
	}

	if (post.section && post.section !== '__undefined__') {
		templates.push(`single-${post.section}`);
	}

	return templates.concat([`single`, `index`]);
};

module.exports = Post;
