import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs', 'umd'],
  globalName: 'dotPathValue',
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  exports: true,
});
