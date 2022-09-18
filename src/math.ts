export function divRem(numer: bigint, denom: bigint): [bigint, bigint] {
  const q = numer / denom;
  const r = numer % denom;
  return [q, r];
}

export function cmp(x: bigint, y: bigint): -1 | 0 | 1 {
  return x === y ? 0 : x < y ? -1 : 1;
}
