import { coerceBigInt } from "./util";

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
