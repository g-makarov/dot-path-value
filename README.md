# dot-path-value

Safely get and set deep nested properties using dot notation.

<a href="https://www.npmjs.com/package/dot-path-value">
  <img alt="npm version" src="https://img.shields.io/npm/v/dot-path-value.svg?style=flat-square" />
</a>
<a href="https://www.npmjs.com/package/dot-path-value">
  <img alt="npm downloads" src="https://img.shields.io/npm/dm/dot-path-value.svg?style=flat-square" />
</a>
<a href="https://bundlephobia.com/package/dot-path-value">
  <img alt="npm minified bundle size" src="https://img.shields.io/bundlephobia/min/dot-path-value?style=flat-square">
</a>
<a href="https://bundlephobia.com/package/dot-path-value">
  <img alt="npm gzip minified bundle size" src="https://img.shields.io/bundlephobia/minzip/dot-path-value?style=flat-square">
</a>
<a href="https://github.com/g-makarov/dot-path-value">
  <img alt="npm gzip minified bundle size" src="https://img.shields.io/github/stars/g-makarov/dot-path-value?style=flat-square">
</a>

## Features

- TypeScript first 🤙
- `getByPath` and `setByPath`
- Support arrays and tuples
- Tiny
- No dependencies
- ESM + CJS, with correct types for both
- Utility types `Path`, `PathValue` and `ArrayPath`

If you find this library useful, why not

<a href="https://www.buymeacoffee.com/gmakarov" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" width="160" height="40"></a>

## Installation

```bash
# using npm
npm install dot-path-value
# using pnpm
pnpm install dot-path-value
# using yarn
yarn add dot-path-value
```

## Usage

```ts
import { getByPath, setByPath } from 'dot-path-value';

const obj = {
  a: {
    b: 'hello',
    d: [
      {
        e: 'world',
      },
    ],
  },
};

// access through object
getByPath(obj, 'a.b'); // outputs 'hello' with type `string`

// access through array
getByPath(obj, 'a.d.0.e'); // outputs 'world' with type `string`
getByPath(obj, 'a.d.0'); // outputs '{ e: 'world' }' with type `{ e: string }`

// also you can pass array as first argument
getByPath([{ a: 1 }], '0.a'); // outputs '1' with type `number`

// typescript errors
getByPath(obj, 'a.b.c'); // `c` property does not exist

// set a property through an object
setByPath(obj, 'a.b', 'hello there');

// missing intermediate objects are created along the way,
// numeric segments create arrays
setByPath(obj, 'a.d.1.e', 'again'); // obj.a.d[1] === { e: 'again' }
```

`setByPath` mutates the object it is given and returns it.

### Path safety

Both functions throw a `TypeError` for paths that are empty, contain an empty segment, or
contain `__proto__`, `constructor` or `prototype`. `setByPath` only follows a segment when the
object owns it, so inherited members (`toString`, `valueOf`, …) are never written through — a
path like `toString.x` creates an own property instead of mutating a shared built-in.

`setByPath` throws when a segment in the middle of the path holds a primitive
(`setByPath({ a: 5 }, 'a.b', 1)`), rather than failing silently.

## Types

`dot-path-value` exports a few types to ensure the type safety:

| Type                  | Description                                                                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `Path<T>`             | converts nested structure `T` into a string representation of the paths to its properties                                                 |
| `PathValue<T, TPath>` | returns the type of the value at the specified path                                                                                       |
| `ArrayPath<T>`        | same as `Path<T>`, but keeps only the paths that lead to an array                                                                         |
| `Primitive`           | the values `Path` treats as leaves at the bottom of a path                                                                                |
| `Terminal`            | everything `Path` does not descend into: `Primitive`, `Date`, `RegExp`, `Error`, functions, `Map`, `Set`, `WeakMap`, `WeakSet`, `Promise` |

Built-in objects are leaves, so `Path<{ createdAt: Date }>` is `'createdAt'` and not the 40+
paths of the `Date` methods.

Paths are generated up to 10 levels deep (`MaxPathDepth`). The limit keeps self-referential
types such as `interface Node { child: Node }` compiling instead of failing with
"circularly references itself". Every type takes the depth as an optional second parameter if
you need something else: `Path<T, 4>`.

Numeric object keys are included, so `Path<{ days: { 1: boolean } }>` is
`'days' | 'days.1'`.

### Using the types in your own generic functions

Take the path as its own type parameter. Otherwise `TPath` stays widened to the full union of
paths and the return type widens to the union of every value type along with it:

```ts
// ❌ `value` is the union of every value type in `T`
function pluck<T extends Record<string, any>>(obj: T, path: Path<T>) {
  return getByPath(obj, path);
}

// ✅ `value` is the type at the path that was actually passed
function pluck<T extends Record<string, any>, TPath extends Path<T>>(obj: T, path: TPath) {
  return getByPath(obj, path);
}
```

This is how `getByPath` and `setByPath` are declared, and it is a TypeScript inference rule
rather than something the library can work around.

### Types usage

```ts
import type { Path, PathValue } from 'dot-path-value';

const obj = {
  a: {
    b: 'hello',
    d: [
      {
        e: 'world',
      },
    ],
  },
};

type Foo = Path<typeof obj>; // 'a.d' | 'a' | 'a.b' | `a.d.${number}` | `a.d.${number}.e`
type Bar = PathValue<typeof obj, 'a.b'>; // 'string'
```
