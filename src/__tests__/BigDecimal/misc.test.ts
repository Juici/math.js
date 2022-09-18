import { BigDecimal } from "../../BigDecimal";

test("isInt", () => {
  expect(new BigDecimal("50").isInt()).toBe(true);
  expect(new BigDecimal("1.0").isInt()).toBe(true);
  expect(new BigDecimal("1.1").isInt()).toBe(false);
});

test("isNeg", () => {
  expect(new BigDecimal("-10").isNeg()).toBe(true);
  expect(new BigDecimal("-6.9").isNeg()).toBe(true);
  expect(new BigDecimal("-0.001").isNeg()).toBe(true);
  expect(new BigDecimal("0").isNeg()).toBe(false);
  expect(new BigDecimal("2").isNeg()).toBe(false);
});

test("isPos", () => {
  expect(new BigDecimal("10").isPos()).toBe(true);
  expect(new BigDecimal("6.9").isPos()).toBe(true);
  expect(new BigDecimal("0.001").isPos()).toBe(true);
  expect(new BigDecimal("0").isPos()).toBe(false);
  expect(new BigDecimal("-2").isPos()).toBe(false);
});

test("isZero", () => {
  expect(new BigDecimal("0").isZero()).toBe(true);
  expect(new BigDecimal("0.0").isZero()).toBe(true);
  expect(new BigDecimal("+0").isZero()).toBe(true);
  expect(new BigDecimal("-0").isZero()).toBe(true);
  expect(new BigDecimal("0.00001").isZero()).toBe(false);
  expect(new BigDecimal("1").isZero()).toBe(false);
});

test("isOne", () => {
  expect(new BigDecimal("1").isOne()).toBe(true);
  expect(new BigDecimal("1.0").isOne()).toBe(true);
  expect(new BigDecimal("1.1").isOne()).toBe(false);
  expect(new BigDecimal("-1").isOne()).toBe(false);
});

test("eq", () => {
  const n = new BigDecimal("1");

  expect(n.eq("1")).toBe(true);
  expect(n.eq(1)).toBe(true);
  expect(n.eq(1n)).toBe(true);
  expect(n.eq({ digits: 1n, scale: 0 })).toBe(true);
  expect(n.eq(n)).toBe(true);

  expect(n.eq("1.0")).toBe(true);
  expect(n.eq("2")).toBe(false);
});

test("cmp", () => {
  const n = new BigDecimal("3");

  expect(n.cmp("3")).toBe(0);
  expect(n.cmp(2.9)).toBe(1);
  expect(n.cmp(4n)).toBe(-1);
  expect(n.cmp({ digits: 31n, scale: 1 })).toBe(-1);
  expect(n.cmp(n)).toBe(0);
});

test("lt", () => {
  const n = new BigDecimal("2");

  expect(n.lt("1")).toBe(false);
  expect(n.lt(2.1)).toBe(true);
  expect(n.lt(3n)).toBe(true);
  expect(n.lt({ digits: 1n, scale: -1 })).toBe(true);
  expect(n.lt(n)).toBe(false);
});

test("le", () => {
  const n = new BigDecimal("-4");

  expect(n.le("-3")).toBe(true);
  expect(n.le(0)).toBe(true);
  expect(n.le(-4)).toBe(true);
  expect(n.le({ digits: -1n, scale: -1 })).toBe(false);
  expect(n.le(n)).toBe(true);
});
