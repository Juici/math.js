import { BigDecimal } from "../../BigDecimal";

test("zero", () => {
  expect(new BigDecimal("0").half()).toEqualDecimal("0");
});

test("even", () => {
  expect(new BigDecimal("10").half()).toEqualDecimal("5");
  expect(new BigDecimal("-4").half()).toEqualDecimal("-2");
});

test("odd", () => {
  expect(new BigDecimal("5").half()).toEqualDecimal("2.5");
  expect(new BigDecimal("-1").half()).toEqualDecimal("-0.5");
});
