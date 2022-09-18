import { BigDecimal } from "../../BigDecimal";

test("positive", () => {
  const v = new BigDecimal("12.3456789");
  expect(v.toFixed(9)).toBe("12.345678900");
  expect(v.toFixed(5)).toBe("12.34568");
  expect(v.toFixed(1)).toBe("12.3");
  expect(v.toFixed(0)).toBe("12");
  expect(v.toFixed()).toBe("12");
});

test("negative", () => {
  const v = new BigDecimal("-12.3456789");
  expect(v.toFixed(9)).toBe("-12.345678900");
  expect(v.toFixed(5)).toBe("-12.34568");
  expect(v.toFixed(1)).toBe("-12.3");
  expect(v.toFixed(0)).toBe("-12");
  expect(v.toFixed()).toBe("-12");
});

test("zero", () => {
  const v = new BigDecimal("0");
  expect(v.toFixed(5)).toBe("0.00000");
  expect(v.toFixed(0)).toBe("0");
  expect(v.toFixed()).toBe("0");
});

test("small", () => {
  const v = new BigDecimal("0.0012345");
  expect(v.toFixed(9)).toBe("0.001234500");
  expect(v.toFixed(6)).toBe("0.001235");
  expect(v.toFixed(4)).toBe("0.0012");
  expect(v.toFixed(2)).toBe("0.00");
  expect(v.toFixed(0)).toBe("0");
  expect(v.toFixed()).toBe("0");
});

test("normalized", () => {
  const v = new BigDecimal("100");
  expect(v.toFixed(2)).toBe("100.00");
  expect(v.toFixed(0)).toBe("100");
  expect(v.toFixed()).toBe("100");
});

test("dp is rounded down to int", () => {
  const v = new BigDecimal("0.456");
  expect(v.toFixed(4.1)).toBe("0.4560");
  expect(v.toFixed(3.9)).toBe("0.456");
  expect(v.toFixed(2.9)).toBe("0.46");
  expect(v.toFixed(0.9)).toBe("0");
});

test("dp less than 0", () => {
  const e = () => new BigDecimal("1.23").toFixed(-0.5);
  expect(e).toThrowErrorMatchingInlineSnapshot(`"Argument 'dp' must be >= 0"`);
});
