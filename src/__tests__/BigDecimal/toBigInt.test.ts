import { BigDecimal } from "../../BigDecimal";

test("zero", () => {
  expect(new BigDecimal("0").toBigInt()).toBe(0n);
});

test("rounding", () => {
  expect(new BigDecimal("0.5").toBigInt()).toBe(1n);
  expect(new BigDecimal("2.3").toBigInt()).toBe(2n);
  expect(new BigDecimal("-6.9").toBigInt()).toBe(-7n);
  expect(new BigDecimal("-1.3").toBigInt()).toBe(-1n);
});

test("not rounding", () => {
  expect(new BigDecimal("5").toBigInt()).toBe(5n);
  expect(new BigDecimal("10").toBigInt()).toBe(10n);
});
