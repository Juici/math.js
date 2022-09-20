import { BigDecimal } from "../../BigDecimal";

test("positive", () => {
  const n = new BigDecimal("12.3456789");
  expect(n.toExponential()).toBe("1.23456789e1");
});
