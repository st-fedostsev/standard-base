/** Преобразует snake_case в camelCase. */
function toCamelCase(key: string): string {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

/**
 * Рекурсивно преобразует ключи обычных объектов и массивов. Значения, даты,
 * файлы и другие объекты не изменяются.
 */
export function keysToCamelCase(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(keysToCamelCase);
  }

  if (typeof value !== 'object' || value === null) {
    return value;
  }

  const prototype = Object.getPrototypeOf(value);

  if (prototype !== Object.prototype && prototype !== null) {
    return value;
  }

  const result: [string, unknown][] = [];
  const usedKeys = new Set<string>();

  for (const [key, nestedValue] of Object.entries(value)) {
    const camelKey = toCamelCase(key);

    // Например, first_name и firstName превратились бы в один ключ.
    if (usedKeys.has(camelKey)) {
      throw new Error(`Повторяющийся ключ после преобразования: ${camelKey}`);
    }

    usedKeys.add(camelKey);
    result.push([camelKey, keysToCamelCase(nestedValue)]);
  }

  return Object.fromEntries(result);
}
