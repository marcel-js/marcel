#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { glob, readFile } from 'node:fs/promises';
import { sep, resolve, join } from 'node:path';

import nunjucks from 'nunjucks';
import { load } from 'js-yaml';

import pkg from './package.json' with { type: 'json' };

const DEFAULT_CONFIG = {
	"datadir": "data",
	"templatesdir": "templates",
	"contentdir": "content",
	"outdir": "dist"
};

const AS_JSON = {
	with: {
		type: 'json'
	}
};

let config = { ...DEFAULT_CONFIG };
let args;

try {
	args = parseArgs({
		options: {
			help: {
				type: 'boolean',
				short: 'h'
			},
			version: {
				type: 'boolean',
				short: 'V'
			},
			config: {
				type: 'string',
				short: 'c'
			},
			datadir: {
				type: 'string'
			},
			templatesdir: {
				type: 'string'
			},
			contentdir: {
				type: 'string'
			},
			outdir: {
				type: 'string'
			}
		}
	});
} catch(err) {
	console.error(err.message);
	outputHelp();
	process.exit(1);
}

const { values, positionals } = args;

if (values.help) {
	outputHelp();
	process.exit(0);
}

if (values.version) {
	console.log(`${pkg.name} ${pkg.version}`);
	process.exit(0);
}

if (values.datadir) config.datadir = values.datadir;
if (values.contentdir) config.contentdir = values.contentdir;
if (values.templatesdir) config.templatesdir = values.templatesdir;
if (values.outdir) config.outdir = values.outdir;

if (values.config) {
	try {
		let userConfig = (await import(resolve(values.config))).default;
		config = {
			...config,
			...(typeof userConfig === 'function' ? await userConfig() : userConfig)
		};
	} catch(err) {
		console.log(err);
		process.exit(1);
	}
}

const datafiles = await Array.fromAsync(
	glob(
		'**/*.{js,json}',
		{
			cwd: config.datadir
		}
	)
);

const globalData = await datafiles.reduce(async (acc, file) => {
	const res = await acc;
	const attrs = /\.json$/.test(file) ? AS_JSON : undefined;
	let value = (await import(resolve(config.datadir, file), attrs)).default;
	if (typeof value === 'function') value = await value();
	const key = file.replace(/\.js(on)?$/, '').split(sep);
	setDeepValue(res, key, value);
	return res;
}, {});

const NunjucksEnv = nunjucks.configure(config.templatesdir, {
	autoescape: true
});

const templatefiles = await Array.fromAsync(
	glob(
		'**/*.{njk,son}',
		{
			cwd: config.templatesdir
		}
	)
);

const sourcefiles = await Array.fromAsync(
	glob(
		'**/*.{txt,md,html,njk,son}', 
		{ 
			cwd: config.contentdir 
		}
	)
);

// TODO: create collections

sourcefiles.forEach(async file => {
	const filecontent = await readFile(join(config.contentdir, file), 'utf8');
	const { data, content } = extractFrontmatter(filecontent);
	const processedContent = await nunjucks.renderString(content, { 
		page: data,
		data: globalData 
	});
});

function extractFrontmatter(filecontent, delim = /(^-{3,}$)/m) {
	const [ws, startDelim, frontmatter, endDelim, ...after] = filecontent.split(delim);
	if (ws.trim() || !after) {
		return { data: {}, content: filecontent };
	}
	return {
		data: load(frontmatter),
		content: after.join(delim)
	};
}

function setDeepValue(obj, keypath, val) {
	const parts = keypath.slice(0, -1);
	let o = obj, k;
	while (k = parts.shift()) {
		if (!Object.hasOwn(o, k)) o[k] = {};
		o = o[k]; 
	}
	o[keypath.at(-1)] = val;
}

function outputHelp() {
	console.log(`${pkg.name} ${pkg.version}`);
	console.log('Help info');
}