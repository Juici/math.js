/**
 * An error parsing a decimal from a string.
 */
export class ParseDecimalError extends Error {
  override readonly name = "ParseDecimalError";
}

/**
 * An error parsing an integer from a string.
 */
export class ParseIntError extends Error {
  override readonly name = "ParseIntError";
}
