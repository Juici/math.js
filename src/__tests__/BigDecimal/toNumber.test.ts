import { BigDecimal } from "../../BigDecimal";

test("toNumber", () => {
  expect(new BigDecimal("1.2345").toNumber()).toBe(1.2345);
});
