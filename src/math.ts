import { ParseIntError } from "./errors/ParseIntError";

export function divRem(numer: bigint, denom: bigint): [bigint, bigint] {
  numer = coerceBigInt(numer);
  denom = coerceBigInt(denom);

  const q = numer / denom;
  const r = numer % denom;

  return [q, r];
}

export function abs(n: bigint): bigint {
  n = coerceBigInt(n);

  return n < 0n ? -n : n;
}

export function sign(n: bigint): -1 | 0 | 1 {
  n = coerceBigInt(n);

  return n === 0n ? 0 : n < 0n ? -1 : 1;
}

export function cmp(x: bigint, y: bigint): -1 | 0 | 1 {
  x = coerceBigInt(x);
  y = coerceBigInt(y);

  return x === y ? 0 : x < y ? -1 : 1;
}

export function parseIntStrict(s: string): number {
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
