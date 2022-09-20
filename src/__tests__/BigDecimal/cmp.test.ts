import { BigDecimal } from "../../BigDecimal";

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
