export function unflattenObject(
  flatObj: Record<string, any>,
): Record<string, any> {
  const result: NestedObject = {};

  // Iterate through all keys in the flat object
  for (const key in flatObj) {
    // Split the key into parts
    const parts = key.split('.');

    // Traverse/create nested structure
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];

      // If the current part doesn't exist, create it
      if (!(part in current)) {
        // Check if next part is a number to determine array or object
        current[part] = parts[i + 1].match(/^\d+$/) ? [] : {};
      }

      current = current[part] as NestedObject;
    }

    // Assign the final value
    const lastPart = parts[parts.length - 1];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    current[lastPart] = flatObj[key];
  }

  return result;
}

type NestedObject = { [key: string]: any };

export function flattenObject(
  obj: NestedObject,
  prefix: string = '',
): NestedObject {
  return Object.keys(obj).reduce((acc: NestedObject, key: string) => {
    const newPrefix = prefix ? `${prefix}.${key}` : key;

    // If the current value is an object (but not null and not an array)
    if (
      typeof obj[key] === 'object' &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      // Recursively flatten nested objects
      return {
        ...acc,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        ...flattenObject(obj[key], newPrefix),
      };
    }

    // For non-object values or arrays, add to the accumulator with dot-separated key
    return {
      ...acc,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      [newPrefix]: obj[key],
    };
  }, {});
}
