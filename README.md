# dot-path-value

Safely get deep nested properties using dot notation.

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

## Features

- TypeScript first 🤙
- Support arrays
- Tiny (198b gzipped)
- No dependencies
- Utility types `Path` and `PathValue`

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
import { getByPath } from 'dot-path-value';

const obj = {
  a: {
    b: 'hello',
    d: [
      {
        e: 'world',
      }
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
```

## Types

`dot-path-value` exports a few types to ensure the type safety:

| Type                  | Description                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------- |
| `Path<T>`             | converts nested structure `T` into a string representation of the paths to its properties |
| `PathValue<T, TPath>` | returns the type of the value at the specified path                                       |

```ts
const obj = {
  a: {
    b: 'hello',
    d: [
      {
        e: 'world',
      }
    ],
  },
};

type Foo = Path<typeof obj>; // 'a.d' | 'a' | 'a.b' | `a.d.${number}` | `a.d.${number}.e`
type Bar = PathValue<typeof obj, 'a.b'>; // 'string'
```
