// Libs
const fs = require('fs-extra');
const { normalize, join } = require('path');
const in_cwd = require('is-path-in-cwd');
const fg = require('fast-glob');
const vfile = require('to-vfile');
const visit = require('unist-util-visit');

// Modules
const mdast_proc = require('./markdown/mdast');
const hast_proc = require('./markdown/hast');
const html_proc = require('./markdown/html');

// Utils
const group_by = require('./util/group-by');
const pretty_url = require('./util/pretty-url');

// Models
const Post = require('./model/post');
const List = require('./model/list');
const Renderer = require('./renderer/nunjucks');

module.exports = class Marcel {
	constructor(cfg) {
		Post.Permalink = post => cfg.permalinks.single(post, cfg);
		List.Permalink = list => cfg.permalinks.list(list, cfg);
		this.renderer = new Renderer(cfg);
		this.config = cfg;
	}

	async run(opts) {
		let options = {
			// whether to include drafts in the build
			drafts: false,
			...opts
		};

		let {
			base,
			dataDir,
			contentDir,
			data,
			markdown,
			permalinks
		} = this.config;

		let finalizer = permalink => {
			let path = pretty_url(permalink, permalinks.pretty);
			return normalize(join(base, path));
		};

		let disk_finalizer = permalink => {
			let path = pretty_url(permalink, permalinks.pretty);
			return normalize(path);
		};

		/*
			Load global data
		 */
		this.data = Object.fromEntries(
			await Promise.all(
				Object.entries(data).map(async ([name, val]) => {
					return [
						name,
						typeof val === 'function' ? await val() : val
					];
				})
			)
		);

		if (dataDir) {
			let data_paths = await fg('**/*.{js,json,yaml,csv,tsv,ndtxt}', {
				cwd: dataDir
			});

			let data_files = await Promise.all(
				data_paths.map(path =>
					vfile
						.read({ path, cwd: dataDir }, 'utf8')
						.then(require('./pipeline/parse-data'))
				)
			);

			// Combine data from the config object
			// with data from the data folder.
			this.data = {
				...this.data,
				...Object.fromEntries(data_files.map(f => [f.stem, f.data]))
			};
		}

		/*
			Load content files
		 */

		let content_paths = await fg('**/*.md', { cwd: contentDir });
		let adjacent_fm = path => path.replace(/\.md$/, '.json');

		let mdast = mdast_proc(markdown);
		let hast = hast_proc(markdown);
		let html = html_proc(markdown);

		let posts = await Promise.all(
			content_paths.map(async path => {
				let post = new Post(
					{},
					{
						finalizer,
						cwd: contentDir,
						frontmatter_path: adjacent_fm(path)
					}
				);
				await post.load(path);
				try {
					await post.execute(this.renderer.env, this.context());
				} catch (err) {
					console.error(`Template rendering error in ${path}:`, err);
				}
				await post.parse(mdast);
				return post;
			})
		);

		/*
			Filter out posts that should not be rendered.
		 */
		posts = posts.filter(
			({ permalink, draft }) =>
				permalink !== false && (!draft || options.drafts)
		);

		/*
			Transform posts from MDAST to HAST
		 */
		posts = await Promise.all(
			posts.map(async post => {
				await post.transform(hast);
				return post;
			})
		);

		/*
			Make sure all links point to the correct permalinks
		 */
		posts.forEach(post => post.apply_permalinks());

		/*
			Transform posts from HAST to HTML
		 */
		posts = await Promise.all(
			posts.map(async post => {
				await post.compile(html);
				return post;
			})
		);

		/*
			Generate lists
			--------------
		 */

		let lists = this.config.lists.reduce((res, t) => {
			let groups = group_by(posts, t.from);

			function include_term(term) {
				return t.include_undefined || term !== '__undefined__';
			}

			let list_index = new List(
				{
					taxonomy: t.from,
					terms: groups
						.filter(item => include_term(item[0]) && item[1].length)
						.map(item => item[0])
				},
				{ finalizer }
			);

			return res
				.concat(
					t.include_index && list_index.terms.length
						? [list_index]
						: []
				)
				.concat(
					groups
						.map(
							item =>
								new List(
									{
										taxonomy: t.from,
										term: item[0],
										posts: item[1]
									},
									{ finalizer }
								)
						)
						.filter(
							l =>
								l.posts.length &&
								(t.include__undefined ||
									l.term !== '__undefined__')
						)
				);
		}, []);

		// Render the individual posts
		await Promise.all(
			posts.map(async post => {
				post.__rendered = await this.renderer.render(
					post.templates,
					this.context({ post }),
					'{{ content }}'
				);
			})
		);

		// Render post lists

		let collections = (await Promise.all(
			lists.map(async list => {
				return {
					permalink: list.permalink,
					__permalink: list.__permalink,
					__rendered: await this.renderer.render(
						list.templates,
						this.context({ list }),
						'{{ posts.length }}'
					)
				};
			})
		)).filter(c => c);

		if (!in_cwd(this.config.distDir)) {
			throw new Error(`
				---
				Configuration error!
				distDir: ${this.config.distDir} is outside the current working directory.
				To avoid deleting things accidentally due to misconfiguration,
				such a path is not currently supported, sorry.
				---
			`);
		}

		/*
			Clean up the `dist` dir
		 */
		await fs.emptyDir(this.config.distDir);

		// Copy the `static` folder over to `dist`
		if (fs.existsSync(this.config.staticDir)) {
			fs.copy(this.config.staticDir, this.config.distDir);
		}

		// Write collections and posts to disk
		collections
			.concat(posts)
			.forEach(entry =>
				this.write(disk_finalizer(entry.__permalink), entry.__rendered)
			);
	}

	async write(permalink, content) {
		fs.outputFileSync(join(this.config.distDir, permalink), content);
	}

	context(extras) {
		return {
			...this.data,
			data: this.data,
			config: this.config,
			Post,
			List,
			...extras
		};
	}
};
