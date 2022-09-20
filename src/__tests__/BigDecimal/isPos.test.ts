import { BigDecimal } from "../../BigDecimal";

test("isPos", () => {
  expect(new BigDecimal("10").isPos()).toBe(true);
  expect(new BigDecimal("6.9").isPos()).toBe(true);
  expect(new BigDecimal("0.001").isPos()).toBe(true);
  expect(new BigDecimal("0").isPos()).toBe(false);
  expect(new BigDecimal("-2").isPos()).toBe(false);
});
