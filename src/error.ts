import { name as PKG_NAME, version as PKG_VERSION } from "../package.json";

const PARSE_DECIMAL_SYMBOL = Symbol.for(`${PKG_NAME}[ParseDecimalError]`);
const PARSE_INT_SYMBOL = Symbol.for(`${PKG_NAME}[ParseIntError]`);

/**
 * An error parsing a decimal from a string.
 */
export class ParseDecimalError extends Error {
  override readonly name = "ParseDecimalError";

  /**
   * Checks if the given object is an instance of ParseDecimalError.
   *
   * @internal
   */
  static [Symbol.hasInstance](instance: unknown): instance is ParseDecimalError {
    return typeof instance === "object" && instance !== null && PARSE_DECIMAL_SYMBOL in instance;
  }
}

// Use a symbol to indentify instances of ParseDecimalError. This helps to
// provide better compatibility for bundled copies of the class.
Object.defineProperty(ParseDecimalError.prototype, PARSE_DECIMAL_SYMBOL, {
  configurable: false,
  enumerable: false,
  value: PKG_VERSION,
  writable: false,
});

/**
 * An error parsing an integer from a string.
 */
export class ParseIntError extends Error {
  override readonly name = "ParseIntError";

  /**
   * Checks if the given object is an instance of ParseIntError.
   *
   * @internal
   */
  static [Symbol.hasInstance](instance: unknown): instance is ParseIntError {
    return typeof instance === "object" && instance !== null && PARSE_INT_SYMBOL in instance;
  }
}

// Use a symbol to indentify instances of ParseIntError. This helps to
// provide better compatibility for bundled copies of the class.
Object.defineProperty(ParseIntError.prototype, PARSE_INT_SYMBOL, {
  configurable: false,
  enumerable: false,
  value: PKG_VERSION,
  writable: false,
});
