import { BigDecimal } from "../../BigDecimal";

test("rounding", () => {
  expect(new BigDecimal("1.25").toDP(1)).toEqualDecimal("1.3");
  expect(new BigDecimal("1.24").toDP(1)).toEqualDecimal("1.2");
});

test("not rounding", () => {
  expect(new BigDecimal("1.25").toDP(5)).toEqualDecimal("1.25");
});

test("invalid dp", () => {
  const e = () => new BigDecimal("1").toDP(-1);
  expect(e).toThrowErrorMatchingInlineSnapshot(`"Argument 'dp' must be >= 0"`);
});
