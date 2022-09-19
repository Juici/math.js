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
  const n = new BigDecimal("0");

  expect(n.cmp("0")).toBe(0);
  expect(n.cmp(-0.1)).toBe(1);
  expect(n.cmp(1n)).toBe(-1);
  expect(n.cmp({ digits: -1n, scale: 0 })).toBe(1);
  expect(n.cmp(n)).toBe(0);
});

test("lt", () => {
  const n = new BigDecimal("2");

  expect(n.lt("1")).toBe(false);
  expect(n.lt(2.1)).toBe(true);
  expect(n.lt(0n)).toBe(false);
  expect(n.lt({ digits: 1n, scale: -1 })).toBe(true);
  expect(n.lt(n)).toBe(false);
});

test("le", () => {
  const n = new BigDecimal("-4");

  expect(n.le("-3")).toBe(true);
  expect(n.le(0.5)).toBe(true);
  expect(n.le(-4n)).toBe(true);
  expect(n.le({ digits: -1n, scale: -1 })).toBe(false);
  expect(n.le(n)).toBe(true);
});

test("gt", () => {
  const n = new BigDecimal("2");

  expect(n.gt("1")).toBe(true);
  expect(n.gt(2.1)).toBe(false);
  expect(n.gt(0n)).toBe(true);
  expect(n.gt({ digits: 1n, scale: -1 })).toBe(false);
  expect(n.gt(n)).toBe(false);
});

test("ge", () => {
  const n = new BigDecimal("-4");

  expect(n.ge("-3")).toBe(false);
  expect(n.ge(0.5)).toBe(false);
  expect(n.ge(-4n)).toBe(true);
  expect(n.ge({ digits: -1n, scale: -1 })).toBe(true);
  expect(n.ge(n)).toBe(true);
});

test("abs", () => {
  expect(new BigDecimal("-1").abs()).toEqualDecimal("1");
  expect(new BigDecimal("0").abs()).toEqualDecimal("0");
  expect(new BigDecimal("1").abs()).toEqualDecimal("1");
});

test("neg", () => {
  const cases: Array<[string, string]> = [
    ["-1", "1"],
    ["0", "0"],
    ["0.5", "-0.5"],
  ];

  for (const [a, b] of cases) {
    const x = new BigDecimal(a);
    const y = new BigDecimal(b);
    expect(x.neg()).toEqualDecimal(y);
    expect(y.neg()).toEqualDecimal(x);
  }
});

test("toNumber", () => {
  expect(new BigDecimal("1.2345").toNumber()).toBe(1.2345);
});
