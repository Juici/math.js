import { cmp, divRem } from "./math";
import { parseDecimal } from "./parse";
import { customInspectSymbol, setHasInstance } from "./util";

import type { InspectOptionsStylized } from "node:util";

export type DecimalValue = string | number | bigint | BigDecimalLike;

export interface BigDecimalLike {
  readonly digits: bigint;
  readonly scale: number;
}

/**
 * A big decimal type.
 */
export class BigDecimal {
  /**
   * The digits in this BigDecimal.
   */
  readonly digits: bigint;
  /**
   * The scale by which the digits in this BigDecimal are shifted.
   */
  readonly scale: number;

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
      this.digits = n;
      this.scale = scale;
    } else {
      [this.digits, this.scale] = components(n);
    }

    [this.digits, this.scale] = normalize(this.digits, this.scale);
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
    const [digits, scale] = normalize(...components(other));
    return this.digits === digits && this.scale === scale;
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

    let d1 = this.digits;
    let d2 = n.digits;

    // Adjust the digits to the same scale.
    if (this.scale < n.scale) {
      d1 *= 10n ** BigInt(n.scale - this.scale);
    } else if (this.scale > n.scale) {
      d2 *= 10n ** BigInt(this.scale - n.scale);
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
  le(other: DecimalValue): boolean {
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
  ge(other: DecimalValue): boolean {
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
    return new BigDecimal(-this.digits, this.scale);
  }

  /**
   * Returns the addition of this BigDecimal with the given value.
   */
  add(other: DecimalValue): BigDecimal {
    const { digits: ld, scale: ls } = this;
    const [rd, rs] = components(other);
    const [l, r, scale] = withScale(ld, ls, rd, rs);
    return new BigDecimal(l + r, scale);
  }

  /**
   * Returns the subtraction of this BigDecimal by the given value.
   */
  sub(other: DecimalValue): BigDecimal {
    const { digits: ld, scale: ls } = this;
    const [rd, rs] = components(other);
    const [l, r, scale] = withScale(ld, ls, rd, rs);
    return new BigDecimal(l - r, scale);
  }

  /**
   * Returns the multiplication of this BigDecimal with the given value.
   */
  mul(other: DecimalValue): BigDecimal {
    let [digits, scale] = components(other);
    digits *= this.digits;
    scale += this.scale;
    return new BigDecimal(digits, scale);
  }

  /**
   * Returns the division of this BigDecimal by the given value.
   *
   * The result is rounded if necessary.
   *
   * @param dp The maximum number of decimal places precision, default `20`.
   * @throws {RangeError} If `other` is `0`.
   */
  div(other: DecimalValue, dp: number = 20): BigDecimal {
    dp = validateDP(dp, "dp");

    const n = new BigDecimal(other);
    if (n.isZero()) {
      throw new RangeError("Division by zero");
    }
    if (this.isZero() || n.isOne()) {
      return this;
    }

    const scale = this.scale - n.scale;
    if (this.digits === n.digits) {
      return new BigDecimal(1n, scale);
    }

    return implDiv(this.digits, n.digits, scale, dp);
  }

  /**
   * Returns the remainder of this BigDecimal divided by the given value.
   *
   * @throws {RangeError} If `other` is `0`.
   */
  rem(other: DecimalValue): BigDecimal {
    const [rd, rs] = components(other);
    if (rd === 0n) {
      throw new RangeError("Division by zero");
    }
    const { digits: ld, scale: ls } = this;
    const [l, r, scale] = withScale(ld, ls, rd, rs);
    return new BigDecimal(l % r, scale);
  }

  /**
   * Returns the division of this BigDecimal by `2`.
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
    dp = validateDP(dp, "dp");

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
  toString(): string {
    const neg = this.digits < 0n;
    const digits = neg ? (-this.digits).toString() : this.digits.toString();
    const len = digits.length;

    let before: string;
    let after: string;

    if (this.scale >= len) {
      before = "0";
      after = "0".repeat(this.scale - len) + digits;
    } else {
      const pos = len - this.scale;
      if (pos > len) {
        before = digits + "0".repeat(pos - len);
        after = "";
      } else {
        before = digits.slice(0, pos);
        after = digits.slice(pos);
      }
    }

    let s = before;
    if (after.length > 0) {
      s += `.${after}`;
    }

    return neg ? `-${s}` : s;
  }

  /**
   * Returns this BigDecimal formatted using fixed-point notation.
   *
   * The result is rounded if necessary, and the fractional component is padded
   * with zeros if necessary so that it has the specified length.
   *
   * @param dp The number of decimal places, default `0`.
   * @throws {RangeError} If `dp` is less than `0`.
   */
  toFixed(dp: number = 0): string {
    dp = validateDP(dp, "dp");

    let digits: bigint = this.digits;
    let scale = this.scale;

    if (dp < scale) {
      const factor = 10n ** BigInt(scale - dp);
      const [q, r] = divRem(digits, factor);

      digits = q + roundingTerm(r);
      scale = dp;
    }

    const neg = digits < 0n;

    let s = neg ? (-digits).toString() : digits.toString();
    const len = s.length;

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
        before = s.slice(0, pos);
        after = s.slice(pos);
      }
    }

    if (dp !== undefined && after.length < dp) {
      after += "0".repeat(dp - after.length);
    }

    s = before;
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
  get [Symbol.toStringTag](): "BigDecimal" {
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
   * @returns A number if `hint` was "number", a string if 'hint' was "string" or "default".
   */
  [Symbol.toPrimitive](hint: string): string | number {
    switch (hint) {
      case "number":
        return this.toNumber();
      case "string":
      case "default":
        return this.toString();
      default:
        throw new TypeError(`Invalid hint: ${hint}`);
    }
  }

  /**
   * Custom inspection function for Node.js.
   *
   * @internal
   */
  [customInspectSymbol](_depth: number, options: InspectOptionsStylized): string {
    return options.stylize(this.toString(), "number");
  }
}

setHasInstance(BigDecimal);

function isBigDecimalLike(n: unknown): n is BigDecimalLike {
  return (
    typeof n === "object" &&
    n !== null &&
    typeof (n as { digits?: unknown }).digits === "bigint" &&
    typeof (n as { scale?: unknown }).scale === "number"
  );
}

function implDiv(numer: bigint, denom: bigint, scale: number, dp: number): BigDecimal {
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

function validateDP(dp: number, arg: string): number {
  if (dp < 0) {
    throw new RangeError(`Argument '${arg}' must be >= 0`);
  }
  return Math.trunc(dp);
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
        throw new RangeError(`BigDecimal must be finite: ${n}`);
      }
      if (Number.isSafeInteger(n)) {
        return [BigInt(n), 0];
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
  } catch (err) {
    throw new TypeError(`Cannot convert '${repr}' to a BigDecimal`, { cause: err });
  }
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

function withScale(ld: bigint, ls: number, rd: bigint, rs: number): [bigint, bigint, number] {
  let scale = ls;
  if (ls < rs) {
    ld *= 10n ** BigInt(rs - ls);
    scale = rs;
  } else if (ls > rs) {
    rd *= 10n ** BigInt(ls - rs);
  }
  return [ld, rd, scale];
}
