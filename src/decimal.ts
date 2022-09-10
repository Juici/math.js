import type { InspectOptionsStylized } from "node:util";

import { ParseDecimalError } from "./error";
import { cmp, divRem } from "./math";
import { customInspectSymbol, parseInt, parseBigInt } from "./util";

import { name as PKG_NAME, version as PKG_VERSION } from "../package.json";

type DecimalValue = string | number | bigint | BigDecimal | BigDecimalLike;

interface BigDecimalLike {
  digits: bigint;
  scale: number;
}

const BIG_DECIMAL_SYMBOL = Symbol.for(`${PKG_NAME}:BigDecimal`);

/**
 * A big decimal type.
 */
export class BigDecimal {
  private digits: bigint;
  private scale: number;

  /**
   * Creates a BigDecimal with the given digits and scale.
   */
  constructor(digits: bigint, scale: number);
  /**
   * Creates a BigDecimal from the given value.
   */
  constructor(n: DecimalValue);

  constructor(n: DecimalValue | bigint, scale?: number) {
    // Use a symbol to indentify instances of BigDecimal. This helps to provide better
    // compatibility for bundled copies of the class.
    Object.defineProperty(this, BIG_DECIMAL_SYMBOL, {
      configurable: false,
      enumerable: false,
      value: PKG_VERSION,
      writable: false,
    });

    if (scale !== undefined) {
      if (!Number.isInteger(scale)) {
        throw new TypeError("Argument 'scale' must be an integer");
      }
      if (typeof n !== "bigint") {
        throw new TypeError("Argument 'digits' must be a bigint");
      }
      this.digits = n;
      this.scale = scale;
      this.normalize();
      return;
    }

    if (isBigDecimalLike(n)) {
      this.digits = n.digits;
      this.scale = n.scale;
      return;
    }

    switch (typeof n) {
      case "bigint":
        this.digits = n;
        this.scale = 0;
        break;

      case "number":
        if (!Number.isFinite(n)) {
          throw new RangeError(`Decimal must be finite: ${n}`);
        } else if (Number.isSafeInteger(n)) {
          this.digits = BigInt(n);
          this.scale = 0;
        } else {
          [this.digits, this.scale] = parseDecimal(n.toExponential());
        }
        break;

      case "string":
        [this.digits, this.scale] = parseDecimal(n);
        break;

      default:
        throw new TypeError(`Invalid argument: ${n}`);
    }

    this.normalize();
  }

  private normalize() {
    if (this.digits === 0n) {
      this.scale = 0;
      return;
    }

    while (this.digits % 10n === 0n) {
      this.digits /= 10n;
      this.scale--;
    }
  }

  /**
   * The number of decimal places in this BigDecimal.
   */
  get dp(): number {
    return this.scale < 0 ? 0 : this.scale;
  }

  /**
   * The sign of this BigDecimal.
   */
  get sign(): -1 | 0 | 1 {
    return this.digits === 0n ? 0 : this.digits < 0n ? -1 : 1;
  }

  /**
   * Checks if this BigDecimal is an integer.
   */
  isInt(): boolean {
    return this.scale <= 0;
  }

  /**
   * Checks if this BigDecimal is negative.
   */
  isNeg(): boolean {
    return this.digits < 0n;
  }

  /**
   * Checks if this BigDecimal is positive.
   */
  isPos(): boolean {
    return this.digits > 0n;
  }

  /**
   * Checks if this BigDecimal is 0.
   */
  isZero(): boolean {
    return this.digits === 0n;
  }

  /**
   * Checks if this BigDecimal is 1.
   */
  isOne(): boolean {
    return this.scale === 0 && this.digits === 1n;
  }

  /**
   * Checks for equality of this BigDecimal with the given value.
   */
  eq(other: DecimalValue): boolean {
    other = new BigDecimal(other);
    return this.digits === other.digits && this.scale === other.scale;
  }

  /**
   * Returns the the ordering of this BigDecimal and the given value.
   */
  cmp(other: DecimalValue): -1 | 0 | 1 {
    other = new BigDecimal(other);

    const s1 = this.sign;
    const s2 = other.sign;

    // Either zero?
    if (s1 === 0 || s2 === 0) {
      return s1 !== 0 ? s1 : s2 !== 0 ? (-s2 as -1 | 1) : 0;
    }

    // Compare signs.
    if (s1 !== s2) {
      return s1;
    }

    if (this.scale === other.scale) {
      return cmp(this.digits, other.digits);
    } else if (this.scale < other.scale) {
      const factor = 10n ** BigInt(other.scale - this.scale);
      return cmp(this.digits * factor, other.digits);
    } else {
      const factor = 10n ** BigInt(this.scale - other.scale);
      return cmp(this.digits, other.digits * factor);
    }
  }

  /**
   * Checks if this BigDecimal is less than the given value.
   */
  lt(other: DecimalValue): boolean {
    return this.cmp(other) < 0;
  }
  /**
   * Checks if this BigDecimal is less than or equal to the given value.
   */
  lte(other: DecimalValue): boolean {
    return this.cmp(other) <= 0;
  }
  /**
   * Checks if this BigDecimal is greater than the given value.
   */
  gt(other: DecimalValue): boolean {
    return this.cmp(other) > 0;
  }
  /**
   * Checks if this BigDecimal is greater than or equal to the given value.
   */
  gte(other: DecimalValue): boolean {
    return this.cmp(other) >= 0;
  }

  /**
   * Returns the absolute value of this BigDecimal.
   */
  abs(): BigDecimal {
    if (this.digits < 0n) {
      const result = new BigDecimal(this);
      result.digits = -result.digits;
      return result;
    }
    return this;
  }

  /**
   * Returns the negation of this BigDecimal.
   */
  neg(): BigDecimal {
    const result = new BigDecimal(this);
    result.digits = -result.digits;
    return result;
  }

  /**
   * Returns the addition of this BigDecimal with the given value.
   */
  add(other: DecimalValue): BigDecimal {
    const result = new BigDecimal(other);
    if (this.scale === result.scale) {
      result.digits = this.digits + result.digits;
    } else if (this.scale < result.scale) {
      const factor = 10n ** BigInt(result.scale - this.scale);
      result.digits = this.digits * factor + result.digits;
    } else {
      const factor = 10n ** BigInt(this.scale - result.scale);
      result.digits = this.digits + result.digits * factor;
      result.scale = this.scale;
    }
    result.normalize();
    return result;
  }

  /**
   * Returns the subtraction of this BigDecimal by the given value.
   */
  sub(other: DecimalValue): BigDecimal {
    const result = new BigDecimal(other);
    if (this.scale === result.scale) {
      result.digits = this.digits - result.digits;
    } else if (this.scale < result.scale) {
      const factor = 10n ** BigInt(result.scale - this.scale);
      result.digits = this.digits * factor - result.digits;
    } else {
      const factor = 10n ** BigInt(this.scale - result.scale);
      result.digits = this.digits - result.digits * factor;
      result.scale = this.scale;
    }
    result.normalize();
    return result;
  }

  /**
   * Returns the multiplication of this BigDecimal with the given value.
   */
  mul(other: DecimalValue): BigDecimal {
    const result = new BigDecimal(other);
    result.scale += this.scale;
    result.digits *= this.digits;
    result.normalize();
    return result;
  }

  /**
   * Returns the division of this BigDecimal by the given value.
   */
  div(other: DecimalValue, dp: number = 100): BigDecimal {
    validateDP(dp);

    other = new BigDecimal(other);
    if (other.isZero()) {
      throw new RangeError("Division by zero");
    }
    if (this.isZero() || other.isOne()) {
      return this;
    }

    const scale = this.scale - other.scale;
    if (this.digits === other.digits) {
      return new BigDecimal(1n, scale);
    }

    return BigDecimal.implDiv(this.digits, other.digits, scale, dp);
  }

  private static implDiv(
    numer: bigint,
    denom: bigint,
    scale: number,
    dp: number,
  ): BigDecimal {
    if (numer === 0n) {
      return new BigDecimal(0n);
    }

    // Shuffle signs around to have position `numer` and `denom`.
    let neg = false;
    if (numer < 0n) {
      numer = -numer;
      if (denom < 0n) {
        denom = -denom;
      } else {
        neg = true;
      }
    } else if (denom < 0n) {
      denom = -denom;
      neg = true;
    }

    // Shift digits of `numer` until larger than `denom`, adjusting `scale` appropriately.
    while (numer < denom) {
      numer *= 10n;
      scale++;
    }

    // First division.
    let [quotient, remainder] = divRem(numer, denom);

    if (scale > dp) {
      while (scale > dp) {
        [quotient, remainder] = divRem(quotient, 10n);

        scale--;
      }

      if (remainder !== 0n) {
        // Round the final number with the remainder.
        quotient += roundingTerm(remainder);
      }
    } else {
      // Shift remainder by 1 place, before loop to find digits of decimal places.
      remainder *= 10n;

      while (remainder !== 0n && scale < dp) {
        const [q, r] = divRem(remainder, denom);

        quotient = quotient * 10n + q;
        remainder = r * 10n;

        scale++;
      }

      if (remainder !== 0n) {
        // Round the final number with the remainder.
        quotient += roundingTerm(remainder / denom);
      }
    }

    const result = new BigDecimal(quotient, scale);
    if (neg) {
      result.digits = -result.digits;
    }
    return result;
  }

  /**
   * Returns the remainder of this BigDecimal divided by the given value.
   */
  rem(other: DecimalValue): BigDecimal {
    const result = new BigDecimal(other);
    if (this.scale === result.scale) {
      result.digits = this.digits % result.digits;
    } else if (this.scale < result.scale) {
      const factor = 10n ** BigInt(result.scale - this.scale);
      result.digits = (this.digits * factor) % result.digits;
    } else {
      const factor = 10n ** BigInt(this.scale - result.scale);
      result.digits = this.digits % (result.digits * factor);
      result.scale = this.scale;
    }
    result.normalize();
    return result;
  }

  /**
   * Returns the division of this BigDecimal by 2.
   *
   * This function is more efficient than `.div(2)`.
   */
  half(): BigDecimal {
    if (this.isZero()) {
      return this;
    } else if (this.digits % 2n === 0n) {
      return new BigDecimal(this.digits / 2n, this.scale);
    } else {
      return new BigDecimal(this.digits * 5n, this.scale + 1);
    }
  }

  /**
   * Returns the value of this BigDecimal rounded to the given number of decimal places.
   */
  toDP(dp: number): BigDecimal {
    validateDP(dp);

    if (dp >= this.scale) {
      return this;
    }

    const factor = 10n ** BigInt(this.scale - dp);
    const [q, r] = divRem(this.digits, factor);

    return new BigDecimal(q + roundingTerm(r), dp);
  }

  /**
   * Returns the value of this BigDecimal converted to a primitive number.
   */
  toNumber(): number {
    return Number(this.toString());
  }

  /**
   * Returns the value of this BigDecimal rounded to a primitive bigint.
   */
  toBigInt(): bigint {
    if (this.scale === 0) {
      return this.digits;
    } else if (this.scale > 0) {
      const factor = 10n ** BigInt(this.scale);
      const [q, r] = divRem(this.digits, factor);

      return q + roundingTerm(r);
    } else {
      const factor = 10n ** BigInt(-this.scale);
      return this.digits * factor;
    }
  }

  /**
   * Returns a string representing the value of this BigDecimal.
   */
  toString(dp?: number): string {
    let digits: bigint | string = this.digits;
    let scale = this.scale;

    if (dp !== undefined && dp < scale) {
      const factor = 10n ** BigInt(scale - dp);
      const [q, r] = divRem(digits, factor);

      digits = q + roundingTerm(r);
      scale = dp;
    }

    const neg = digits < 0n;

    digits = neg ? (-digits).toString() : digits.toString();
    const len = digits.length;

    let before: string;
    let after: string;

    if (scale >= len) {
      before = "0";
      after = "0".repeat(scale - len) + digits;
    } else {
      const pos = len - scale;
      if (pos > len) {
        before = digits + "0".repeat(pos - len);
        after = "";
      } else {
        before = digits.slice(0, pos);
        after = digits.slice(pos);
      }
    }

    if (dp !== undefined) {
      if (after.length < dp) {
        after += "0".repeat(dp - after.length);
      } else {
        after = after.slice(0, dp);
      }
    }

    let s = before;
    if (after.length > 0) {
      s += "." + after;
    }

    return neg ? "-" + s : s;
  }

  /**
   * Returns a string representing the value of this BigDecimal.
   */
  toJSON(): string {
    return this.toString();
  }

  /**
   * Returns a string representing the value of this BigDecimal.
   */
  valueOf(): string {
    return this.toString();
  }

  /**
   * Getter for the string tag used in the `Object.prototype.toString` method.
   */
  get [Symbol.toStringTag]() {
    return "BigDecimal";
  }

  /**
   * Converts a BigDecimal into a string.
   */
  [Symbol.toPrimitive](hint: "string"): string;
  /**
   * Converts a BigDecimal into a number.
   */
  [Symbol.toPrimitive](hint: "number" | "default"): number;
  /**
   * Converts a BigDecimal into a string or number.
   *
   * @param hint The string "string", "number", or "default" to specify what primitive to return.
   *
   * @throws {TypeError} If `hint` was given something other than "string", "number", or "default".
   * @returns A number if `hint` was "number" or "default", a string if 'hint' was "string".
   */
  [Symbol.toPrimitive](hint: string): string | number {
    switch (hint) {
      case "string":
        return this.toString();
      case "number":
      case "default":
        return this.toNumber();
      default:
        throw new TypeError(`Invalid hint: ${hint}`);
    }
  }

  /**
   * Custom inspection function for Node.js.
   */
  [customInspectSymbol](
    _depth: number,
    options: InspectOptionsStylized,
  ): string {
    return options.stylize(this.toString(), "number");
  }

  /**
   * Checks if the given object is an instance of BigDecimal.
   */
  static [Symbol.hasInstance](instance: unknown): instance is BigDecimal {
    return BigDecimal.isBigDecimal(instance);
  }

  /**
   * Checks if the given object is an instance of BigDecimal.
   */
  static isBigDecimal(instance: unknown): instance is BigDecimal {
    return (
      typeof instance === "object" &&
      instance !== null &&
      BIG_DECIMAL_SYMBOL in instance
    );
  }
}

function isBigDecimalLike(n: unknown): n is BigDecimalLike {
  return (
    typeof n === "object" &&
    n !== null &&
    "digits" in n &&
    "scale" in n &&
    typeof (n as { digits: unknown }).digits === "bigint" &&
    typeof (n as { scale: unknown }).scale === "number"
  );
}

function parseDecimal(s: string): [bigint, number] {
  const expSeparator = s.search(/[eE]/);

  let mantissa = s;
  let exp = 0;
  if (expSeparator !== -1) {
    mantissa = s.slice(0, expSeparator);
    exp = parseInt(s.slice(expSeparator + 1));
  }

  if (mantissa.length === 0) {
    throw new ParseDecimalError(
      `Cannot parse decimal with empty mantissa: ${s}`,
    );
  }

  const decimalSeparator = mantissa.indexOf(".");

  let digits = mantissa;
  let decimalOffset = 0;
  if (decimalSeparator !== -1) {
    const trailing = mantissa.slice(decimalSeparator + 1);
    digits = mantissa.slice(0, decimalSeparator) + trailing;
    decimalOffset = trailing.length;
  }

  const value = parseBigInt(digits);
  const scale = decimalOffset - exp;

  return [value, scale];
}

function roundingTerm(n: bigint): -1n | 0n | 1n {
  // Compare by char code to avoid parsing digit.
  // 53 is the UTF-16 char code of "5".
  if (n < 0n) {
    const digit = (-n).toString().charCodeAt(0);
    return digit >= 53 ? -1n : 0n;
  } else {
    const digit = n.toString().charCodeAt(0);
    return digit >= 53 ? 1n : 0n;
  }
}

function validateDP(dp: number) {
  if (dp < 0 || !Number.isInteger(dp)) {
    throw new RangeError(
      "Decimal places must be an integer greater than or equal to 0",
    );
  }
}
