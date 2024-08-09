# Marcel Changelog

### Unreleased

-   [CLI] Show help when no command has been invoked ([#44](https://github.com/marceljs/marcel/issues/44))
-   [CLI] Adds `--watch` option for `build`/`serve` ([#21](https://github.com/marceljs/marcel/issues/21))
-   Custom filters are now loaded from the `filters` option in the config file, rather than from individual files on disk. This makes the feature more flexible, allowing npm packages, etc.

### 0.3.0

-   Adds support for taxonomies, changes the single/list template hierarchy.
-   Write to file synchronously to make sure the order is deterministic.

### 0.2.1

-   Fixes `v8-compile-cache` dependency.

### 0.2.0

-   Adds support for `.js` data files ([#42](https://github.com/marceljs/marcel/issues/42)).
-   Adds `build` (default) and `serve` commands to the CLI ([#22](https://github.com/marceljs/marcel/issues/22)).
-   Adds support for sync/async custom filters ([#43](https://github.com/marceljs/marcel/issues/43)). For this, we switched to async rendering for Nunjucks.
-   Adds the `format_date` filter.
-   Adds the `sort_by` filter to sort lists of posts by property. Added sorting by date. Fall back `.date` and `.updated` to file attributes. ([#33](https://github.com/marceljs/marcel/issues/33))
-   Posts that have `draft: true` in their front-matter will not be built / served by default. Pass in `-d` or `--drafts` to the CLI commands to include the draft posts. ([#41](https://github.com/marceljs/marcel/issues/41)) Posts that have `permalink: false` in their front-matter will not be included in the build.
-   Posts that have their `slug` / `permalink` ending in `.html` will not get `/index.html` appended to them.
-   Adds `post.template` to be able to add a specific template to the post.

### 0.1.3

The beginning of time.
