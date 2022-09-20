import { BigDecimal } from "../../BigDecimal";

test("isOne", () => {
  expect(new BigDecimal("1").isOne()).toBe(true);
  expect(new BigDecimal("1.0").isOne()).toBe(true);
  expect(new BigDecimal("1.1").isOne()).toBe(false);
  expect(new BigDecimal("-1").isOne()).toBe(false);
});
