import { BigDecimal } from "../../BigDecimal";

test("isNeg", () => {
  expect(new BigDecimal("-10").isNeg()).toBe(true);
  expect(new BigDecimal("-6.9").isNeg()).toBe(true);
  expect(new BigDecimal("-0.001").isNeg()).toBe(true);
  expect(new BigDecimal("0").isNeg()).toBe(false);
  expect(new BigDecimal("2").isNeg()).toBe(false);
});
