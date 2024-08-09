#!/usr/bin/env node
require('v8-compile-cache');
const program = require('commander');
const handler = require('serve-handler');
const micro = require('micro');
const watch = require('glob-watcher');

const pkg = require('../package.json');
const Marcel = require('./marcel');
const config = require('./config');

program.version(pkg.version);

async function run(cfg, options) {
	await new Marcel(cfg).run({
		drafts: options.drafts
	});
}

async function bundle(options) {
	let cfg = await config();
	if (options.watch) {
		watch(
			'.',
			{
				ignored: [/node_modules/, cfg.distDir],
				cwd: process.cwd()
			},
			() => {
				console.log('Rebuilding...');
				return run(cfg, options);
			}
		);
	}
	run(cfg, options);
}

async function serve(options) {
	let cfg = await config();
	await bundle(options);
	const server = micro(async (req, res) => {
		return handler(req, res, {
			public: cfg.distDir
		});
	});
	let p = options.port || 3000;
	server.listen(p);
	console.log(`Started server at: http://localhost:${p}`);
}

program
	.command('serve')
	.description('Start a development server')
	.option('-w, --watch', 'Watch for changes and rebuild')
	.option('-d, --drafts', 'Include drafts')
	.option('--port [port]', 'port (default: 3000)')
	.action(serve);

program
	.command('build')
	.option('-w, --watch', 'Watch for changes and rebuild')
	.option('-d, --drafts', 'Include drafts')
	.description('Build the website')
	.action(bundle);

if (process.argv.length < 3) {
	program.outputHelp();
}

program.parse(process.argv);
