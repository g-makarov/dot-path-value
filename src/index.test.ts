import { getByPath } from './index';

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
});
