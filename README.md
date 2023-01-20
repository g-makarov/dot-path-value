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
import { getByPath } from "dot-path-value";

const obj = {
  a: {
    b: {
      c: "hello",
    },
  },
};

getByPath(obj, "a.b.c"); // outputs 'hello'
```

## Types

`dot-path-value` exports a few types to ensure the type safety:

| Type                  | Description                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------- |
| `Path<T>`             | converts nested structure `T` into a string representation of the paths to its properties |
| `PathValue<T, TPath>` | returns the type of the value at the specified path                                       |
