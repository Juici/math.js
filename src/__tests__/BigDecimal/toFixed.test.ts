import { BigDecimal } from "../../BigDecimal";

test("positive", () => {
  const n = new BigDecimal("12.3456789");
  expect(n.toFixed(9)).toBe("12.345678900");
  expect(n.toFixed(5)).toBe("12.34568");
  expect(n.toFixed(1)).toBe("12.3");
  expect(n.toFixed(0)).toBe("12");
  expect(n.toFixed()).toBe("12");
});

test("negative", () => {
  const n = new BigDecimal("-12.3456789");
  expect(n.toFixed(9)).toBe("-12.345678900");
  expect(n.toFixed(5)).toBe("-12.34568");
  expect(n.toFixed(1)).toBe("-12.3");
  expect(n.toFixed(0)).toBe("-12");
  expect(n.toFixed()).toBe("-12");
});

test("zero", () => {
  const n = new BigDecimal("0");
  expect(n.toFixed(5)).toBe("0.00000");
  expect(n.toFixed(0)).toBe("0");
  expect(n.toFixed()).toBe("0");
});

test("small positive", () => {
  const n = new BigDecimal("0.0012345");
  expect(n.toFixed(9)).toBe("0.001234500");
  expect(n.toFixed(6)).toBe("0.001235");
  expect(n.toFixed(4)).toBe("0.0012");
  expect(n.toFixed(2)).toBe("0.00");
  expect(n.toFixed(0)).toBe("0");
  expect(n.toFixed()).toBe("0");
});

test("small negative", () => {
  const n = new BigDecimal("-0.0012345");
  expect(n.toFixed(9)).toBe("-0.001234500");
  expect(n.toFixed(6)).toBe("-0.001235");
  expect(n.toFixed(4)).toBe("-0.0012");
  expect(n.toFixed(2)).toBe("0.00");
  expect(n.toFixed(0)).toBe("0");
  expect(n.toFixed()).toBe("0");
});

test("positive normalized", () => {
  const n = new BigDecimal("100");
  expect(n.toFixed(2)).toBe("100.00");
  expect(n.toFixed(0)).toBe("100");
  expect(n.toFixed()).toBe("100");
});

test("negative normalized", () => {
  const n = new BigDecimal("-100");
  expect(n.toFixed(2)).toBe("-100.00");
  expect(n.toFixed(0)).toBe("-100");
  expect(n.toFixed()).toBe("-100");
});

test("dp is rounded down to int", () => {
  const n = new BigDecimal("0.456");
  expect(n.toFixed(4.1)).toBe("0.4560");
  expect(n.toFixed(3.9)).toBe("0.456");
  expect(n.toFixed(2.9)).toBe("0.46");
  expect(n.toFixed(0.9)).toBe("0");
});

test("dp less than 0", () => {
  const e = () => new BigDecimal("1.23").toFixed(-0.5);
  expect(e).toThrowErrorMatchingInlineSnapshot(`"Argument 'dp' must be >= 0"`);
});
