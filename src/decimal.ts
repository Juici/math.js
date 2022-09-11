import { name as PKG_NAME, version as PKG_VERSION } from "../package.json";

import { ParseDecimalError } from "./error";
import { cmp, divRem } from "./math";
import { customInspectSymbol, parseBigInt, parseInt } from "./util";

import type { InspectOptionsStylized } from "node:util";

type DecimalValue = string | number | bigint | BigDecimal | BigDecimalLike;

interface BigDecimalLike {
  digits: bigint;
  scale: number;
}

const BIG_DECIMAL_SYMBOL = Symbol.for(`${PKG_NAME}[BigDecimal]`);

/**
 * A big decimal type.
 */
export class BigDecimal {
  private readonly _digits: bigint;
  private readonly _scale: number;

  /**
   * Creates a BigDecimal with the given digits and scale.
   */
  constructor(digits: bigint, scale: number);
  /**
   * Creates a BigDecimal from the given value.
   */
  constructor(n: DecimalValue);

  constructor(n: DecimalValue | bigint, scale?: number) {
    if (scale !== undefined) {
      if (!Number.isInteger(scale)) {
        throw new TypeError("Argument 'scale' must be an integer");
      }
      if (typeof n !== "bigint") {
        throw new TypeError("Argument 'digits' must be a bigint");
      }
      this._digits = n;
      this._scale = scale;
    } else {
      [this._digits, this._scale] = components(n);
    }

    [this._digits, this._scale] = normalize(this._digits, this._scale);
  }

  /**
   * The digits in this BigDecimal.
   */
  get digits(): bigint {
    return this._digits;
  }

  /**
   * The scale by which the digits in this BigDecimal are shifted.
   */
  get scale(): number {
    return this._scale;
  }

  /**
   * The number of decimal places in this BigDecimal.
   */
  get dp(): number {
    return this._scale < 0 ? 0 : this._scale;
  }

  /**
   * The sign of this BigDecimal.
   */
  get sign(): -1 | 0 | 1 {
    return this._digits === 0n ? 0 : this._digits < 0n ? -1 : 1;
  }

  /**
   * Checks if this BigDecimal is an integer.
   */
  isInt(): boolean {
    return this._scale <= 0;
  }

  /**
   * Checks if this BigDecimal is negative.
   */
  isNeg(): boolean {
    return this._digits < 0n;
  }

  /**
   * Checks if this BigDecimal is positive.
   */
  isPos(): boolean {
    return this._digits > 0n;
  }

  /**
   * Checks if this BigDecimal is 0.
   */
  isZero(): boolean {
    return this._digits === 0n;
  }

  /**
   * Checks if this BigDecimal is 1.
   */
  isOne(): boolean {
    return this._scale === 0 && this._digits === 1n;
  }

  /**
   * Checks for equality of this BigDecimal with the given value.
   */
  eq(other: DecimalValue): boolean {
    const [digits, scale] = normalize(...components(other));
    return this._digits === digits && this._scale === scale;
  }

  /**
   * Returns the the ordering of this BigDecimal and the given value.
   */
  cmp(other: DecimalValue): -1 | 0 | 1 {
    const n = new BigDecimal(other);

    const s1 = this.sign;
    const s2 = n.sign;

    // Either zero?
    if (s1 === 0 || s2 === 0) {
      return s1 !== 0 ? s1 : s2 !== 0 ? (-s2 as -1 | 1) : 0;
    }

    // Compare signs.
    if (s1 !== s2) {
      return s1;
    }

    let d1 = this._digits;
    let d2 = n._digits;

    // Adjust the digits to the same scale.
    if (this._scale < n._scale) {
      d1 *= 10n ** BigInt(n._scale - this._scale);
    } else if (this._scale > n._scale) {
      d2 *= 10n ** BigInt(this._scale - n._scale);
    }

    return cmp(d1, d2);
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
    return this.isNeg() ? this.neg() : this;
  }

  /**
   * Returns the negation of this BigDecimal.
   */
  neg(): BigDecimal {
    return new BigDecimal(-this._digits, this._scale);
  }

  /**
   * Returns the addition of this BigDecimal with the given value.
   */
  add(other: DecimalValue): BigDecimal {
    const { _digits: ld, _scale: ls } = this;
    const [rd, rs] = components(other);
    const [l, r, scale] = withScale(ld, ls, rd, rs);
    return new BigDecimal(l + r, scale);
  }

  /**
   * Returns the subtraction of this BigDecimal by the given value.
   */
  sub(other: DecimalValue): BigDecimal {
    const { _digits: ld, _scale: ls } = this;
    const [rd, rs] = components(other);
    const [l, r, scale] = withScale(ld, ls, rd, rs);
    return new BigDecimal(l - r, scale);
  }

  /**
   * Returns the multiplication of this BigDecimal with the given value.
   */
  mul(other: DecimalValue): BigDecimal {
    let [digits, scale] = components(other);
    digits *= this._digits;
    scale += this._scale;
    return new BigDecimal(digits, scale);
  }

  /**
   * Returns the division of this BigDecimal by the given value.
   */
  div(other: DecimalValue, dp: number = 100): BigDecimal {
    validateDP(dp);

    const n = new BigDecimal(other);
    if (n.isZero()) {
      throw new RangeError("Division by zero");
    }
    if (this.isZero() || n.isOne()) {
      return this;
    }

    const scale = this._scale - n._scale;
    if (this._digits === n._digits) {
      return new BigDecimal(1n, scale);
    }

    return implDiv(this._digits, n._digits, scale, dp);
  }

  /**
   * Returns the remainder of this BigDecimal divided by the given value.
   */
  rem(other: DecimalValue): BigDecimal {
    const { _digits: ld, _scale: ls } = this;
    const [rd, rs] = components(other);
    const [l, r, scale] = withScale(ld, ls, rd, rs);
    return new BigDecimal(l % r, scale);
  }

  /**
   * Returns the division of this BigDecimal by 2.
   *
   * This function is more efficient than `.div(2)`.
   */
  half(): BigDecimal {
    if (this.isZero()) {
      return this;
    } else if (this._digits % 2n === 0n) {
      return new BigDecimal(this._digits / 2n, this._scale);
    } else {
      return new BigDecimal(this._digits * 5n, this._scale + 1);
    }
  }

  /**
   * Returns the value of this BigDecimal rounded to the given number of decimal places.
   */
  toDP(dp: number): BigDecimal {
    validateDP(dp);

    if (dp >= this._scale) {
      return this;
    }

    const factor = 10n ** BigInt(this._scale - dp);
    const [q, r] = divRem(this._digits, factor);

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
    if (this._scale === 0) {
      return this._digits;
    } else if (this._scale > 0) {
      const factor = 10n ** BigInt(this._scale);
      const [q, r] = divRem(this._digits, factor);
      return q + roundingTerm(r);
    } else {
      const factor = 10n ** BigInt(-this._scale);
      return this._digits * factor;
    }
  }

  /**
   * Returns a string representing the value of this BigDecimal.
   */
  toString(dp?: number): string {
    let digits: bigint | string = this._digits;
    let scale = this._scale;

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
      s += `.${after}`;
    }

    return neg ? `-${s}` : s;
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
  get [Symbol.toStringTag](): string {
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

// Use a symbol to indentify instances of BigDecimal. This helps to provide better
// compatibility for bundled copies of the class.
Object.defineProperty(BigDecimal.prototype, BIG_DECIMAL_SYMBOL, {
  configurable: false,
  enumerable: false,
  value: PKG_VERSION,
  writable: false,
});

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

function implDiv(
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

  return new BigDecimal(neg ? -quotient : quotient, scale);
}

function validateDP(dp: number) {
  if (dp < 0 || !Number.isInteger(dp)) {
    throw new RangeError(
      "Decimal places must be an integer greater than or equal to 0",
    );
  }
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

function components(n: DecimalValue): [bigint, number] {
  if (isBigDecimalLike(n)) {
    return [n.digits, n.scale];
  }

  switch (typeof n) {
    case "bigint":
      return [n, 0];

    case "number":
      if (!Number.isFinite(n)) {
        throw new RangeError(`Decimal must be finite: ${n}`);
      }
      if (Number.isInteger(n)) {
        return [BigInt(Number.isSafeInteger(n) ? n : n.toFixed()), 0];
      }
      return parseDecimal(n.toExponential());

    case "string":
      return parseDecimal(n);

    default:
      break;
  }

  // Whilst our API says we don't accept any other types here, we'll make a
  // best attempt to try to parse a big decimal from the string representation.
  const repr = String(n);
  try {
    return parseDecimal(repr);
  } catch (e) {
    throw new TypeError(`Cannot convert '${repr}' to a BigDecimal`);
  }
}

function parseDecimal(s: string): [bigint, number] {
  let e = s.indexOf("e");
  if (e === -1) {
    e = s.indexOf("E");
  }

  let mantissa = s;
  let exp = 0;
  if (e !== -1) {
    mantissa = s.slice(0, e);

    const expStr = s.slice(e + 1);
    if (expStr.length === 0) {
      throw new ParseDecimalError(
        `Cannot parse decimal with empty exponent: ${s}`,
      );
    }
    exp = parseInt(expStr);
  }

  if (mantissa.length === 0) {
    throw new ParseDecimalError(
      `Cannot parse decimal with empty mantissa: ${s}`,
    );
  }

  const dot = mantissa.indexOf(".");

  let digits = mantissa;
  let decimalOffset = 0;
  if (dot !== -1) {
    const trailing = mantissa.slice(dot + 1);
    digits = mantissa.slice(0, dot) + trailing;
    decimalOffset = trailing.length;
  }

  const value = parseBigInt(digits);
  const scale = decimalOffset - exp;

  return [value, scale];
}

function normalize(digits: bigint, scale: number): [bigint, number] {
  if (digits === 0n) {
    return [0n, 0];
  }
  while (digits % 10n === 0n) {
    digits /= 10n;
    scale--;
  }
  return [digits, scale];
}

function withScale(
  ld: bigint,
  ls: number,
  rd: bigint,
  rs: number,
): [bigint, bigint, number] {
  let scale = ls;
  if (ls < rs) {
    ld *= 10n ** BigInt(rs - ls);
    scale = rs;
  } else if (ls > rs) {
    rd *= 10n ** BigInt(ls - rs);
  }
  return [ld, rd, scale];
}
