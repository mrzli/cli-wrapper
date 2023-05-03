export function camelCaseToKebabCase(value: string): string {
  return value
    .replace(
      /([\p{Lowercase_Letter}\p{Uppercase_Letter}\d])(\p{Uppercase_Letter})/gu,
      '$1-$2'
    )
    .toLowerCase();
}

export function kebabCaseToCamelCase(value: string): string {
  return value.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
