import { describe, expect, test } from 'vitest';

import { getByPath, hasByPath, setByPath } from './index';

describe('getByPath', () => {
  const obj = { a: { b: { c: 1 } }, d: [{ e: 2 }, { e: 3 }] };

  test('should return the value at the specified path', () => {
    expect(getByPath(obj, 'a.b.c')).toBe(1);
    expect(getByPath(obj, 'd.0')).toBe(obj.d[0]);
    expect(getByPath(obj, 'd.1.e')).toBe(3);
  });

  test('should work with arrays', () => {
    const arr = [1, 2, { a: 3 }];
    expect(getByPath(arr, '0')).toBe(1);
    expect(getByPath(arr, '2.a')).toBe(3);
  });

  test('should work with numeric object keys', () => {
    const days = { days: { 1: true, '2': false, 3: true } };
    expect(getByPath(days, 'days.1')).toBe(true);
    expect(getByPath(days, 'days.2')).toBe(false);
    expect(getByPath(days, 'days.3')).toBe(true);
  });

  test('should work with optional keys', () => {
    interface ObjType {
      a?: {
        b: {
          c: string;
        };
      };
    }
    const obj: ObjType = {};
    expect(getByPath(obj, 'a.b.c')).toBe(undefined);
  });

  test('should return undefined when the path runs through null', () => {
    expect(getByPath({ a: null } as { a: { b: string } | null }, 'a.b' as any)).toBe(undefined);
  });

  test('should reject unsafe path segments', () => {
    expect(() => getByPath({ a: 1 }, '__proto__.x' as any)).toThrow(TypeError);
    expect(() => getByPath({ a: 1 }, 'a.constructor' as any)).toThrow(TypeError);
  });

  test('should reject empty paths and empty segments', () => {
    expect(() => getByPath({ a: 1 }, '' as any)).toThrow(TypeError);
    expect(() => getByPath({ a: 1 }, 'a..b' as any)).toThrow(TypeError);
  });
});

describe('hasByPath', () => {
  test('should tell a missing key apart from one set to undefined', () => {
    const obj = { name: 'Jane', surname: undefined };

    expect(getByPath(obj, 'surname')).toBe(undefined);
    expect(hasByPath(obj, 'surname')).toBe(true);
    expect(hasByPath(obj, 'nickname' as any)).toBe(false);
  });

  test('should walk nested paths', () => {
    const obj = { a: { b: { c: 1 } } };

    expect(hasByPath(obj, 'a')).toBe(true);
    expect(hasByPath(obj, 'a.b')).toBe(true);
    expect(hasByPath(obj, 'a.b.c')).toBe(true);
    expect(hasByPath(obj, 'a.b.d' as any)).toBe(false);
    expect(hasByPath(obj, 'x.y' as any)).toBe(false);
  });

  test('should work with arrays', () => {
    const obj = { d: [{ e: 2 }] };

    expect(hasByPath(obj, 'd.0')).toBe(true);
    expect(hasByPath(obj, 'd.0.e')).toBe(true);
    expect(hasByPath(obj, 'd.1')).toBe(false);
    expect(hasByPath([1, 2, 3], '2')).toBe(true);
    expect(hasByPath([1, 2, 3], '3')).toBe(false);
  });

  test('should not descend through null, undefined or primitives', () => {
    expect(hasByPath({ a: null } as { a: { b: string } | null }, 'a.b' as any)).toBe(false);
    expect(hasByPath({ a: undefined } as { a?: { b: string } }, 'a.b')).toBe(false);
    expect(hasByPath({ a: 5 }, 'a.b' as any)).toBe(false);
    expect(hasByPath({ a: 'hi' }, 'a.0' as any)).toBe(false);
  });

  test('should not report inherited properties as present', () => {
    expect(hasByPath({} as Record<string, unknown>, 'toString' as any)).toBe(false);
    expect(hasByPath({ a: 1 }, 'a.valueOf' as any)).toBe(false);
  });

  test('should report own properties holding falsy values', () => {
    const obj = { zero: 0, empty: '', no: false, nil: null };

    expect(hasByPath(obj, 'zero')).toBe(true);
    expect(hasByPath(obj, 'empty')).toBe(true);
    expect(hasByPath(obj, 'no')).toBe(true);
    expect(hasByPath(obj, 'nil')).toBe(true);
  });

  test('should reject unsafe path segments', () => {
    expect(() => hasByPath({ a: 1 }, '__proto__.x' as any)).toThrow(TypeError);
    expect(() => hasByPath({ a: 1 }, 'a.constructor' as any)).toThrow(TypeError);
  });

  test('should reject empty paths and empty segments', () => {
    expect(() => hasByPath({ a: 1 }, '' as any)).toThrow(TypeError);
    expect(() => hasByPath({ a: 1 }, 'a..b' as any)).toThrow(TypeError);
  });
});

describe('setByPath', () => {
  test('should set the value at the specified path', () => {
    const obj = { a: { b: { c: 1 } }, d: [{ e: 2 }, { e: 3 }] };

    setByPath(obj, 'a.b.c', 2);
    expect(obj.a.b.c).toEqual(2);

    setByPath(obj, 'd.0.e', 4);
    expect(obj.d[0]?.e).toEqual(4);

    setByPath(obj, 'd', []);
    expect(obj.d).toEqual([]);
  });

  test('should work with arrays', () => {
    const arr = [1, 2, { a: 3 }];
    setByPath(arr, '0', 5);
    expect(arr[0]).toBe(5);

    setByPath(arr, '2.a', 6);
    expect(getByPath(arr, '2.a')).toBe(6);
  });

  test('should return the changed object', () => {
    const obj = { a: { b: { c: 1 } }, d: [{ e: 2 }, { e: 3 }] };
    const result = setByPath(obj, 'a.b.c', 2);
    expect(result).toBe(obj);
  });

  test('should a value in paths containing optional properties', () => {
    interface ObjType {
      a?: {
        b: {
          c: string;
        };
      };
    }
    const obj: ObjType = {};
    setByPath(obj, 'a.b.c', 'test');
    expect(obj).toEqual({
      a: {
        b: {
          c: 'test',
        },
      },
    });
  });

  test('should create arrays for numeric segments', () => {
    interface ObjType {
      a?: { b: string }[];
    }
    const obj: ObjType = {};
    setByPath(obj, 'a.0.b', 'test');

    expect(Array.isArray(obj.a)).toBe(true);
    expect(obj).toEqual({ a: [{ b: 'test' }] });
  });

  test('should replace null placeholders on the way to the target', () => {
    const obj = { a: null } as { a: { b: string } | null };
    setByPath(obj, 'a.b' as any, 'test');
    expect(obj).toEqual({ a: { b: 'test' } });
  });

  test('should throw when a path segment holds a primitive', () => {
    const obj = { a: 5 };
    expect(() => setByPath(obj, 'a.b' as any, 1)).toThrow(TypeError);
    expect(obj.a).toBe(5);
  });

  test('should reject __proto__ paths (prototype pollution)', () => {
    expect(() => setByPath({} as Record<string, unknown>, '__proto__.polluted' as any, 1)).toThrow(
      TypeError,
    );
    expect(({} as { polluted?: string }).polluted).toBeUndefined();
  });

  test('should reject constructor and prototype path segments', () => {
    const obj = { a: 1 };
    expect(() => setByPath(obj, 'a.constructor.prototype.polluted' as any, 1)).toThrow(TypeError);
  });

  test('should not write through inherited properties', () => {
    const obj = {} as Record<string, unknown>;
    setByPath(obj, 'toString.polluted' as any, 1);

    expect(
      (Object.prototype.toString as unknown as { polluted?: number }).polluted,
    ).toBeUndefined();
    expect(obj).toEqual({ toString: { polluted: 1 } });
  });

  test('should reject empty paths and empty segments', () => {
    expect(() => setByPath({ a: 1 }, '' as any, 1)).toThrow(TypeError);
    expect(() => setByPath({ a: 1 }, 'a..b' as any, 1)).toThrow(TypeError);
  });
});
