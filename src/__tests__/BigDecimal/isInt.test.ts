import { BigDecimal } from "../../BigDecimal";

test("isInt", () => {
  expect(new BigDecimal("50").isInt()).toBe(true);
  expect(new BigDecimal("1.0").isInt()).toBe(true);
  expect(new BigDecimal("1.1").isInt()).toBe(false);
});
