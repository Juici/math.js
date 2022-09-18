export function printWithType<T>(name: string, value: T, print: (value: T) => string): string {
  const type = typeof value;
  const hasType =
    value !== null && value !== undefined
      ? `${name} has type:  ${type === "object" ? value.constructor?.name ?? type : type}\n`
      : "";
  const hasValue = `${name} has value: ${print(value)}`;
  return hasType + hasValue;
}
