import { ParseDecimalError } from "./errors";

const isInt = (s: string) => /^[+-]?\d+$/.test(s);

export function parseDecimal(s: string): [bigint, number] {
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
      throw new ParseDecimalError(`Cannot parse empty exponent: ${s}`);
    }

    if (!isInt(expStr)) {
      throw new ParseDecimalError(`Cannot parse integer exponent: ${expStr}`);
    }
    exp = Number(expStr);
  }

  if (mantissa.length === 0) {
    throw new ParseDecimalError(`Cannot parse empty mantissa: ${s}`);
  }

  const dot = mantissa.indexOf(".");

  let digits = mantissa;
  let decimalOffset = 0;
  if (dot !== -1) {
    const trailing = mantissa.slice(dot + 1);
    digits = mantissa.slice(0, dot) + trailing;
    decimalOffset = trailing.length;
  }

  if (!isInt(digits)) {
    throw new ParseDecimalError(`Cannot parse integer digits: ${digits}`);
  }

  const value = BigInt(digits);
  const scale = decimalOffset - exp;

  return [value, scale];
}
