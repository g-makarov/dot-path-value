import { describe, expectTypeOf, test } from 'vitest';

import {
  getByPath,
  hasByPath,
  setByPath,
  type ArrayPath,
  type Path,
  type PathValue,
} from './index';

interface Obj {
  a: {
    b: string;
    d: { e: string }[];
  };
  t: [number, { q: boolean }];
  createdAt: Date;
  optional?: { deep: number };
}

describe('Path', () => {
  test('enumerates object, array and tuple paths', () => {
    expectTypeOf<Path<{ a: { b: string } }>>().toEqualTypeOf<'a' | 'a.b'>();
    expectTypeOf<Path<{ d: { e: string }[] }>>().toEqualTypeOf<
      'd' | `d.${number}` | `d.${number}.e`
    >();
    expectTypeOf<Path<{ t: [number, { q: boolean }] }>>().toEqualTypeOf<
      't' | 't.0' | 't.1' | 't.1.q'
    >();
  });

  test('treats built-in objects as leaves', () => {
    expectTypeOf<Path<{ createdAt: Date }>>().toEqualTypeOf<'createdAt'>();
    expectTypeOf<Path<{ m: Map<string, number> }>>().toEqualTypeOf<'m'>();
    expectTypeOf<Path<{ s: Set<string> }>>().toEqualTypeOf<'s'>();
    expectTypeOf<Path<{ r: RegExp }>>().toEqualTypeOf<'r'>();
    expectTypeOf<Path<{ f: () => void }>>().toEqualTypeOf<'f'>();
    expectTypeOf<Path<{ p: Promise<string> }>>().toEqualTypeOf<'p'>();
  });

  test('resolves self-referential types up to the depth limit', () => {
    interface TreeNode {
      name: string;
      child: TreeNode;
    }

    expectTypeOf<'child.child.child.name'>().toExtend<Path<TreeNode>>();
  });

  test('unwraps optional properties', () => {
    expectTypeOf<'optional.deep'>().toExtend<Path<Obj>>();
  });

  test('picks up numeric object keys', () => {
    expectTypeOf<Path<{ days: { 1: boolean; '2': boolean; 3: boolean } }>>().toEqualTypeOf<
      'days' | 'days.1' | 'days.2' | 'days.3'
    >();
  });
});

describe('ArrayPath', () => {
  test('keeps only paths that lead to arrays', () => {
    expectTypeOf<ArrayPath<Obj>>().toEqualTypeOf<'a.d' | 't'>();
    expectTypeOf<ArrayPath<{ createdAt: Date }>>().toEqualTypeOf<never>();
  });
});

describe('PathValue', () => {
  test('resolves the value at a path', () => {
    expectTypeOf<PathValue<Obj, 'a.b'>>().toEqualTypeOf<string>();
    expectTypeOf<PathValue<Obj, 'a.d'>>().toEqualTypeOf<{ e: string }[]>();
    expectTypeOf<PathValue<Obj, `a.d.${number}.e`>>().toEqualTypeOf<string>();
    expectTypeOf<PathValue<Obj, 't.1.q'>>().toEqualTypeOf<boolean>();
    expectTypeOf<PathValue<Obj, 'createdAt'>>().toEqualTypeOf<Date>();
  });

  test('adds undefined for optional segments', () => {
    expectTypeOf<PathValue<Obj, 'optional.deep'>>().toEqualTypeOf<number | undefined>();
  });

  test('resolves numeric object keys', () => {
    interface Days {
      days: { 1: boolean; '2': number; 3: string };
    }

    expectTypeOf<PathValue<Days, 'days.1'>>().toEqualTypeOf<boolean>();
    expectTypeOf<PathValue<Days, 'days.2'>>().toEqualTypeOf<number>();
    expectTypeOf<PathValue<Days, 'days.3'>>().toEqualTypeOf<string>();
  });
});

describe('getByPath', () => {
  const obj = {} as Obj;

  test('infers the value type', () => {
    expectTypeOf(getByPath(obj, 'a.b')).toEqualTypeOf<string>();
    expectTypeOf(getByPath(obj, 'a.d.0.e')).toEqualTypeOf<string>();
    expectTypeOf(getByPath(obj, 'createdAt')).toEqualTypeOf<Date>();
    expectTypeOf(getByPath([{ a: 1 }], '0.a')).toEqualTypeOf<number>();
  });

  test('rejects unknown paths', () => {
    // @ts-expect-error `c` does not exist
    getByPath(obj, 'a.b.c');
    // @ts-expect-error `Date` methods are not paths
    getByPath(obj, 'createdAt.toISOString');
  });
});

describe('hasByPath', () => {
  const obj = {} as Obj;

  test('returns a boolean', () => {
    expectTypeOf(hasByPath(obj, 'a.b')).toEqualTypeOf<boolean>();
    expectTypeOf(hasByPath(obj, 'optional.deep')).toEqualTypeOf<boolean>();
    expectTypeOf(hasByPath([{ a: 1 }], '0.a')).toEqualTypeOf<boolean>();
  });

  test('rejects unknown paths', () => {
    // @ts-expect-error `c` does not exist
    hasByPath(obj, 'a.b.c');
  });
});

describe('setByPath', () => {
  const obj = {} as Obj;

  test('returns the same object type', () => {
    expectTypeOf(setByPath(obj, 'a.b', 'hello')).toEqualTypeOf<Obj>();
  });

  test('rejects mismatched values', () => {
    // @ts-expect-error `a.b` is a string
    setByPath(obj, 'a.b', 1);
  });
});
