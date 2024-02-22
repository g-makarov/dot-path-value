export type Primitive = null | undefined | string | number | boolean | symbol | bigint;

type ArrayKey = number;

type IsTuple<T extends readonly any[]> = number extends T['length'] ? false : true;

type TupleKeys<T extends readonly any[]> = Exclude<keyof T, keyof any[]>;

export type PathConcat<TKey extends string | number, TValue> = TValue extends Primitive
  ? `${TKey}`
  : `${TKey}` | `${TKey}.${Path<TValue>}`;

export type Path<T> = T extends readonly (infer V)[]
  ? IsTuple<T> extends true
    ? {
        [K in TupleKeys<T>]-?: PathConcat<K & string, T[K]>;
      }[TupleKeys<T>]
    : PathConcat<ArrayKey, V>
  : {
      [K in keyof T]-?: PathConcat<K & string, T[K]>;
    }[keyof T];

type ArrayPathConcat<TKey extends string | number, TValue> = TValue extends Primitive
  ? never
  : TValue extends readonly (infer U)[]
  ? U extends Primitive
    ? never
    : `${TKey}` | `${TKey}.${ArrayPath<TValue>}`
  : `${TKey}.${ArrayPath<TValue>}`;

export type ArrayPath<T> = T extends readonly (infer V)[]
  ? IsTuple<T> extends true
    ? {
        [K in TupleKeys<T>]-?: ArrayPathConcat<K & string, T[K]>;
      }[TupleKeys<T>]
    : ArrayPathConcat<ArrayKey, V>
  : {
      [K in keyof T]-?: ArrayPathConcat<K & string, T[K]>;
    }[keyof T];

export type PathValue<T, TPath extends Path<T> | ArrayPath<T>> = T extends any
  ? TPath extends `${infer K}.${infer R}`
    ? K extends keyof T
      ? R extends Path<T[K]>
        ? undefined extends T[K]
          ? PathValue<T[K], R> | undefined
          : PathValue<T[K], R>
        : never
      : K extends `${ArrayKey}`
      ? T extends readonly (infer V)[]
        ? PathValue<V, R & Path<V>>
        : never
      : never
    : TPath extends keyof T
    ? T[TPath]
    : TPath extends `${ArrayKey}`
    ? T extends readonly (infer V)[]
      ? V
      : never
    : never
  : never;

export function getByPath<T extends Record<string, any>, TPath extends Path<T>>(
  obj: T,
  path: TPath,
): PathValue<T, TPath> {
  return path.split('.').reduce((acc, key) => acc?.[key], obj) as PathValue<T, TPath>;
}

function getPathFromRelative<T>(path: Path<T>, relativePath?: string): Path<T> {
  if (!relativePath || relativePath.trim() === '') {
    return path;
  }

  const segments = relativePath.split(/[\\/]/);
  let referencePathArray = path.split('.');

  while (segments.length > 0) {
    const segment = segments.shift();
    if (segment === '..') {
      referencePathArray.pop();
    } else if (segment) {
      // Add a check for a non-empty segment
      referencePathArray.push(segment);
    }
  }

  return referencePathArray.join('.') as Path<T>;
}

export function getByRelativePath<T extends Record<string, any>, TPath extends Path<T>>(
  obj: T,
  path: TPath,
  relativePath: string,
): PathValue<T, TPath> {
  const newPath = getPathFromRelative<T>(path, relativePath);
  if (newPath === '') {
    return obj as PathValue<T, TPath>;
  }
  return getByPath(obj, newPath as TPath);
}

export function setByPath<T extends Record<string, any>, TPath extends Path<T>>(
  obj: T,
  path: TPath,
  value: PathValue<T, TPath>,
) {
  const segments = path.split('.') as TPath[];
  const lastKey = segments.pop();

  let target: T = obj;

  for (let i = 0; i < segments.length; i++) {
    const key = segments[i] as TPath;
    if (!(key in target)) {
      target[key] = {} as PathValue<T, TPath>;
    }
    target = target[key];
  }

  if (lastKey) {
    target[lastKey] = value;
  }

  return obj;
}

export function setByRelativePath<T extends Record<string, any>, TPath extends Path<T>>(
  obj: T,
  path: TPath,
  relativePath: string,
  value: unknown,
) {
  const targetPath = getPathFromRelative<T>(path, relativePath);
  return setByPath(obj, targetPath as TPath, value as PathValue<T, TPath>);
}
