# marcel

<a href="https://www.npmjs.org/package/marcel"><img src="https://img.shields.io/npm/v/marcel.svg?style=flat" alt="npm version"></a>

A simple, pluggable, static site generator built in JavaScript.

> ⚠️ Marcel is currently in the prototyping phase!

## The name

Like [Hugo](https://gohugo.io), Marcel is named after a [great writer](https://en.wikipedia.org/wiki/Marcel_Proust). Also:

-   it's a riff on [parcel](https://parceljs.org/), the application bundler — but, like, for Markdown. Parcel + Markdown = Marcel;
-   I have a very close friend named Marcel who's a philosopher;
-   the slot for `marcel` on [npm](https://npmjs.com/package/marcel) was free :)

## The why

I want to build a generator just the way I like it:

-   Have the templates in an expressive language that allows for inheritance; hence [nunjucks](https://mozilla.github.io/nunjucks/) (which is related to Twig and Jinja2, for PHP and Python, respectively).
-   Keep the content mostly Markdown, but have better control on how it gets transformed to HTML
-   Organize the content (and the matching templates for that content) in a way that makes sense. The [template hierarchy](https://forklor.github.io/wp-template-hierarchy) is is one of the best parts in WordPress.
-   etc etc.

## Goals

Learn how to build a _fast_, _user-friendly_ static site generator that you can pick up quickly. It should be able to build most simple sites out of the box, with predictable results. For more complex tasks, a plugin system should make it easy to customize the various aspects of the pipeline.

Document the thinking and the technical decisions, so that anyone who's interested can understand how to build such a tool.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Cognates

Projects that have similar aims to Marcel:

-   [Jekyll](https://jekyllrb.com/) (Ruby)
-   [Hugo](https://gohugo.io/) (Go)
-   [Eleventy](https://11ty.io) (JS)
-   [Zola](https://getzola.org/) (Rust)

And some interesting approaches:

-   [Pollen](https://docs.racket-lang.org/pollen/) (Racket)
