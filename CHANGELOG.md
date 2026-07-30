# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.1.0

### Fixed

- `setByPath` no longer follows inherited properties. It used `key in target`, which sees the
  prototype chain, so `setByPath({}, 'toString.x', 1)` wrote onto `Object.prototype.toString` —
  a shared built-in. Only own properties are followed now, and such a path creates an own
  property on the target instead.
- `setByPath` creates arrays for numeric path segments. `setByPath({}, 'a.0.b', 1)` now produces
  `{ a: [{ b: 1 }] }` instead of `{ a: { '0': { b: 1 } } }`.
- `setByPath` replaces `null` placeholders on the way to the target instead of throwing
  `Cannot use 'in' operator` on the next segment.
- `setByPath` throws a descriptive `TypeError` when a segment in the middle of a path holds a
  primitive, e.g. `setByPath({ a: 5 }, 'a.b', 1)`.
- Both functions reject empty paths and paths with empty segments (`'a..b'`). Previously
  `setByPath(obj, '')` silently did nothing.
- Package exports are fixed for CommonJS consumers: `require()` used to resolve to ESM type
  declarations (`attw` reported "masquerading as ESM" and a TypeScript fallback-condition bug).
  A separate `.d.cts` is now shipped and `publint` and `attw` are clean on all resolvers.

### Changed

- **Breaking:** `Path`, `ArrayPath` and `PathValue` no longer descend into built-in objects.
  `Date`, `RegExp`, `Error`, functions, `Map`, `WeakMap`, `Set`, `WeakSet` and `Promise` are
  leaves, so `Path<{ createdAt: Date }>` is `'createdAt'` rather than the 40+ paths of the
  `Date` methods. The set is exported as `Terminal`.
- **Breaking:** path generation is bounded to 10 levels (`MaxPathDepth`). This lets
  self-referential types such as `interface Node { child: Node }` compile instead of failing
  with "circularly references itself". Every type accepts the depth as an optional last type
  parameter, e.g. `Path<T, 4>`.
- **Breaking:** `setByPath` with an empty path now throws instead of doing nothing.
- The ESM entry point is `dist/index.mjs` (was `dist/index.esm.js`).
- `engines.node` is declared as `>=18` and verified in CI against Node 18, 20, 22 and 24.

### Internal

- Build moved from microbundle to tsdown; tests from Jest to Vitest, with type-level tests
  (`expectTypeOf`) running under `vitest --typecheck`.
- Formatting moved from Prettier to oxfmt, linting added with oxlint.
- Added CI (lint, format, typecheck, tests, build, `publint` + `attw`, plus runtime smoke tests
  of the built artifacts on every supported Node version) and a tag-triggered release workflow
  publishing with npm provenance.
