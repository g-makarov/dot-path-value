import { getByPath, setByPath } from './index';

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
});

describe('setByPath', () => {
  test("should set the value at the specified path", () => {
    const obj = { a: { b: { c: 1 } }, d: [{ e: 2 }, { e: 3 }] };

    setByPath(obj, "a.b.c", 2);
    expect(obj.a.b.c).toEqual(2);

    setByPath(obj, "d.0.e", 4);
    expect(obj.d[0]?.e).toEqual(4);

    setByPath(obj, "d", []);
    expect(obj.d).toEqual([]);
  });

  test('should work with arrays', () => {
    const arr = [1, 2, { a: 3 }];
    setByPath(arr, "0", 5);
    expect(arr[0]).toBe(5);

    setByPath(arr, '2.a', 6)
    expect(getByPath(arr, '2.a')).toBe(6);

  });

  test('should set nothing if the parent path does not exist', () => {
    interface ObjType {
      a?: {
        b: {
          c: string;
        };
      };
    }
    const obj: ObjType = {};
    setByPath(obj, 'a.b.c', 'test');
    expect(obj).toEqual({});
  });
});
