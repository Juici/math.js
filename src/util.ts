import { ParseIntError } from "./error";

export const customInspectSymbol = Symbol.for("nodejs.util.inspect.custom");

export function parseInt(s: string): number {
  if (!/^[+-]?\d+$/.test(s)) {
    throw new ParseIntError(`Cannot parse integer: ${s}`);
  }
  return Number(s);
}

export function parseBigInt(s: string): bigint {
  if (!/^[+-]?\d+$/.test(s)) {
    throw new ParseIntError(`Cannot parse integer: ${s}`);
  }
  return BigInt(s);
}

type ToBigInt = string | number | bigint | boolean;

export function coerceBigInt(n: ToBigInt | { valueOf(): ToBigInt }): bigint {
  const x = typeof n === "object" ? n.valueOf() : n;
  if (Number.isInteger(x) && !Number.isSafeInteger(x)) {
    BigInt((x as number).toFixed());
  }
  return BigInt(x);
}
