import { BigDecimal } from "../../BigDecimal";

test("positive", () => {
  const n = new BigDecimal("1234.56789");
  expect(n.toExponential()).toBe("1.23456789e+3");
  expect(n.toExponential(10)).toBe("1.2345678900e+3");
  expect(n.toExponential(5)).toBe("1.23457e+3");
  expect(n.toExponential(2)).toBe("1.23e+3");
  expect(n.toExponential(1)).toBe("1.2e+3");
  expect(n.toExponential(0)).toBe("1e+3");
});

test("negative", () => {
  const n = new BigDecimal("-1234.56789");
  expect(n.toExponential()).toBe("-1.23456789e+3");
  expect(n.toExponential(10)).toBe("-1.2345678900e+3");
  expect(n.toExponential(5)).toBe("-1.23457e+3");
  expect(n.toExponential(2)).toBe("-1.23e+3");
  expect(n.toExponential(1)).toBe("-1.2e+3");
  expect(n.toExponential(0)).toBe("-1e+3");
});

test("zero", () => {
  const n = new BigDecimal("0");
  expect(n.toExponential()).toBe("0e+0");
  expect(n.toExponential(5)).toBe("0.00000e+0");
  expect(n.toExponential(0)).toBe("0e+0");
});

test("small positive", () => {
  const n = new BigDecimal("0.0012345");
  expect(n.toExponential()).toBe("1.2345e-3");
  expect(n.toExponential(6)).toBe("1.234500e-3");
  expect(n.toExponential(3)).toBe("1.235e-3");
  expect(n.toExponential(2)).toBe("1.23e-3");
  expect(n.toExponential(0)).toBe("1e-3");
});

test("small negative", () => {
  const n = new BigDecimal("-0.0012345");
  expect(n.toExponential()).toBe("-1.2345e-3");
  expect(n.toExponential(6)).toBe("-1.234500e-3");
  expect(n.toExponential(3)).toBe("-1.235e-3");
  expect(n.toExponential(2)).toBe("-1.23e-3");
  expect(n.toExponential(0)).toBe("-1e-3");
});

test("positive normalized", () => {
  const n = new BigDecimal("100");
  expect(n.toExponential()).toBe("1e+2");
  expect(n.toExponential(2)).toBe("1.00e+2");
  expect(n.toExponential(0)).toBe("1e+2");
});

test("negative normalized", () => {
  const n = new BigDecimal("-100");
  expect(n.toExponential()).toBe("-1e+2");
  expect(n.toExponential(2)).toBe("-1.00e+2");
  expect(n.toExponential(0)).toBe("-1e+2");
});

test("dp is rounded down to int", () => {
  const n = new BigDecimal("0.456");
  expect(n.toExponential(3.1)).toBe("4.560e-1");
  expect(n.toExponential(2.9)).toBe("4.56e-1");
  expect(n.toExponential(1.9)).toBe("4.6e-1");
  expect(n.toExponential(0.9)).toBe("5e-1");
});

test("dp less than 0", () => {
  const e = () => new BigDecimal("1.23").toExponential(-0.5);
  expect(e).toThrowErrorMatchingInlineSnapshot(`"Argument 'dp' must be >= 0"`);
});
