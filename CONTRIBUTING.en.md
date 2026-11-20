# Contributing Guide

[简体中文](./CONTRIBUTING.md) | English

Thanks for your interest in contributing to vue-layerx! Please take a few minutes to read this guide before submitting.

## Issues

- Search [existing issues](https://github.com/xuyimingwork/vue-layerx/issues) and the [docs](https://xuyimingwork.github.io/vue-layerx/) first.
- For bugs, include the versions of vue-layerx, Vue, and your dialog component library, plus a **minimal reproduction**. You can fork one of the Playground links at the top of the README, or share a StackBlitz or a repository.
- For feature requests, describe the use case first. Some designs are deliberate trade-offs. See the [ADRs](./docs/adr/README.md).

## Pull Requests

- Branch off `main` and open the PR against `main`.
- Open an issue to discuss new features first. For bug fixes, reference the issue in the PR (`fix #xxx`).
- Every feature or fix should come with tests.
- The same `dist` runs on both Vue 2.7 and Vue 3, so make sure behavior is consistent across both. Version-specific code belongs only in `src/compat/vue2` and `src/compat/vue3`.
- Do not add runtime dependencies.
- When changing public API or behavior, update:
  - `README.md` and `README.en.md`
  - `docs/`
  - the `Unreleased` section of `CHANGELOG.md`
- Follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat` / `fix` / `docs` / `refactor` / `test` / `chore` …). Mark breaking changes with `!` and a `BREAKING CHANGE:` footer. The `release:` prefix is reserved for releases.

## Development Setup

Requires Node.js 20+ and pnpm 9:

```bash
pnpm install   # also enables .githooks, which regenerates the README TOC on commit
```

There is no ESLint or Prettier setup, so match the surrounding code: 2-space indent, single quotes, no semicolons.

## Scripts

```bash
pnpm test                    # short for test:unit
pnpm test:unit               # unit + full-library typecheck (source)
pnpm typecheck               # library source tsc only (already in test:unit)
pnpm build                   # build dist/
pnpm test:integration:vue3   # Vue 3 integration tests (consume dist; build first; short: test:integration)
pnpm test:integration:vue2   # Vue 2.7 integration tests (consume dist; build first)
pnpm test:integration:all    # build, then vue3 + vue2 in parallel
pnpm test:ci                 # same gate as CI: typecheck ∥ integration:all ∥ coverage:all
pnpm demos:vue3              # Vue 3 + Element Plus demos (short: demos)
pnpm demos:vue2              # Vue 2.7 + Element UI demos
pnpm docs:dev                # docs site
```

Before opening a PR, make sure `pnpm test:ci` and `pnpm readme:toc --check` pass.

## Project Structure

```
src/            source: api / config / runtime / shared / compat / types
tests-vue3/     Vue 3 integration tests
tests-vue2/     Vue 2.7 integration tests
demos-vue3/     Vue 3 demos
demos-vue2/     Vue 2.7 demos
docs/           docs site and ADRs
```

## Tests

- Unit tests live next to the source in `src/**/__test__/`.
- Integration tests are organized by public API, one file each, and **only consume `dist`**.
- Name test cases `should … when …`.

See [TESTING.md](./TESTING.md) for details and [DESIGN.md](./DESIGN.md) for design background.
