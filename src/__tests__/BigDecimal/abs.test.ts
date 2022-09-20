import { BigDecimal } from "../../BigDecimal";

test("abs", () => {
  expect(new BigDecimal("-1").abs()).toEqualDecimal("1");
  expect(new BigDecimal("0").abs()).toEqualDecimal("0");
  expect(new BigDecimal("1").abs()).toEqualDecimal("1");
});
