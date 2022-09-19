import { BigDecimal } from "../../BigDecimal";

test.each([
  { x: "1", y: "1", z: "1" },
  { x: "1", y: "-1", z: "-1" },
  { x: "-1", y: "-1", z: "1" },
  { x: "0.1", y: "0.2", z: "0.5" },
  { x: "0.01", y: "-2", z: "-0.005" },
])("$x / $y = $z", ({ x, y, z }) => {
  expect(new BigDecimal(x).div(y)).toEqualDecimal(z);
  expect(new BigDecimal(x).div(z)).toEqualDecimal(y);
});

test("division by zero", () => {
  const e = () => new BigDecimal("1").div("0");
  expect(e).toThrowErrorMatchingInlineSnapshot(`"Division by zero"`);
});
