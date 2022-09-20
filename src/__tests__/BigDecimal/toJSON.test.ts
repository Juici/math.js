import { BigDecimal } from "../../BigDecimal";

test("toJSON", () => {
  expect(new BigDecimal("1.2345").toJSON()).toBe("1.2345");
  expect(JSON.stringify(new BigDecimal("0.00123"))).toBe(`"0.00123"`);
});
