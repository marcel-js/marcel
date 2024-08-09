# Contributing to Marcel

Contributions of all kinds are welcome! Please open an issue, if one doesn't exist yet, to discuss your contribution before submitting a PR for it.

## Developing Marcel

### Prerequisites

-   Node and NPM
-   Yarn

### Installation

Clone the repository and run `yarn` inside the folder to install the necessary dependencies.

### Running tests

```bash
yarn test
```

### Publishing to npm

> ⚠️ This is only available to the package maintainers.

**Update the changelog:** Rename _Unreleased_ to the name of the new version, and stage the file.

**Publish on npm:** Run `yarn publish` and follow instructions.

**Push to remote:**

```bash
# push the version-bumping commit
git push origin head

# push the release
git push --tags
```
