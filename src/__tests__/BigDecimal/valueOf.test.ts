import { BigDecimal } from "../../BigDecimal";

test("valueOf", () => {
  expect(new BigDecimal("-6.9").valueOf()).toBe("-6.9");
});
