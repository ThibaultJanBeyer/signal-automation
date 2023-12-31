/**
 * Convert all null in an object values to undefined,
 * and remove the null type from the object keys
 */
export function nullKeysToUndefined<T extends Record<string, any>>(
  obj: T,
): { [K in keyof T]: Exclude<T[K], null> } {
  return typedObjectKeys(obj).reduce(
    (acc, key) => {
      if (obj[key] === null) {
        // @ts-expect-error yes this is what we want
        acc[key] = undefined;
      } else {
        acc[key] = obj[key];
      }
      return acc;
    },
    {} as { [K in keyof T]: Exclude<T[K], null> },
  );
}

/**
 * Object.keys but preserves the type of the keys
 */
export function typedObjectKeys<T extends object>(object: T) {
  return Object.keys(object) as (keyof typeof object)[];
}

export function removeEmpty<
  T extends Record<string, any> | undefined | unknown,
>(obj: T): T | undefined {
  return Object.fromEntries(
    Object.entries(obj || {})
      .filter(([_, v]) => {
        return (
          typeof v === "number" ||
          (!!v && Object.values(v || {}).filter((v) => !!v).length > 0)
        );
      })
      .map(([k, v]) => [k, v === Object(v) ? removeEmpty(v) : v]),
  ) as T | undefined;
}
