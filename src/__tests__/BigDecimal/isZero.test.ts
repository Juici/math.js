import { BigDecimal } from "../../BigDecimal";

test("isZero", () => {
  expect(new BigDecimal("0").isZero()).toBe(true);
  expect(new BigDecimal("0.0").isZero()).toBe(true);
  expect(new BigDecimal("+0").isZero()).toBe(true);
  expect(new BigDecimal("-0").isZero()).toBe(true);
  expect(new BigDecimal("0.00001").isZero()).toBe(false);
  expect(new BigDecimal("1").isZero()).toBe(false);
});
