import { getByPath, getByRelativePath, setByPath, setByRelativePath } from './index';

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

describe('getByRelativePath', () => {
  test('should return the value at the specified relative path', () => {
    const obj = { a: { b: { c: 1 } }, d: [{ e: 2 }, { e: 3 }] };
    expect(getByRelativePath(obj, 'a.b.c', '..')).toBe(obj.a.b);
    expect(getByRelativePath(obj, 'd.1.e', '')).toBe(obj.d[1]?.e);
    expect(getByRelativePath(obj, 'd.0', '../0')).toBe(obj.d[0]);
    expect(getByRelativePath(obj, 'd.1.e', '../..')).toBe(obj.d);
    expect(getByRelativePath(obj, 'd.1.e', '../../../..')).toBe(obj);
  });

  test('should work with arrays', () => {
    const arr = [{ a: 1 }, { b: { c: 2 } }];
    expect(getByRelativePath(arr, '0', '..')).toBe(arr);
    expect(getByRelativePath(arr, '2.a', '..')).toBe(arr[2]);
    expect(getByRelativePath(arr, '2.a', '../..')).toBe(arr);
  });

  test('should work with a mix of back references and forward paths', () => {
    const obj = { a: { b: { c: 1 } }, d: [{ e: 2 }, { e: 3 }] };
    expect(getByRelativePath(obj, 'd.1.e', '../../0.e')).toBe(obj.d[0]?.e);
    expect(getByRelativePath(obj, 'd.1.e', '../../../d.0.e')).toBe(obj.d[0]?.e);
  });

  test('should work with a mix of back references and forward paths using only slashes', () => {
    const obj = { a: { b: { c: 1 } }, d: [{ e: 2 }, { e: 3 }] };
    // expect(getByRelativePath(obj, 'd.1.e', '../../0/e')).toBe(obj.d[0]?.e);
    // expect(getByRelativePath(obj, 'd.1.e', '../../../d/0/e')).toBe(obj.d[0]?.e);
    expect(getByRelativePath(obj, 'd.1.e', '..\\..\\..\\d\\0\\e')).toBe(obj.d[0]?.e);
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
});

describe('setByRelativePath', () => {
  test('should set the value at the specified relative path', () => {
    const obj = { a: { b: { c: 1 } }, d: [{ e: 2 }, { e: 3 }] };

    setByRelativePath(obj, 'a.b.c', '', 2);
    expect(obj.a.b.c).toBe(2);

    setByRelativePath(obj, 'a.b.c', '..', 2);
    expect(obj.a.b).toBe(2);

    setByRelativePath(obj, 'a.b.c', '../../../d', 2);
    expect(obj.d).toBe(2);

    const objBeforeFailedSet = structuredClone(obj);

    setByRelativePath(obj, 'a.b.c', '../../../..', 2);
    expect(obj).toEqual(objBeforeFailedSet);
  });

  test('should work with arrays', () => {
    const arr = [{ a: 1 }, { b: { c: 2 } }];

    setByRelativePath(arr, '1.b', '..', 3);
    expect(arr).toEqual([{ a: 1 }, 3]);

    setByRelativePath(arr, '1.b', '../../0/a', 3);
    expect(arr).toEqual([{ a: 3 }, 3]);
  });
});
