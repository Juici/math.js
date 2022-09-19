import { BigDecimal } from "../../BigDecimal";

test.each([
  { x: "1", y: "1", z: "0" },
  { x: "1", y: "-1", z: "0" },
  { x: "-1", y: "-1", z: "0" },
  { x: "0.1", y: "0.2", z: "0.1" },
  { x: "2", y: "0.9", z: "0.2" },
  { x: "-1", y: "0.3", z: "-0.1" },
])("$x / $y = $z", ({ x, y, z }) => {
  expect(new BigDecimal(x).rem(y)).toEqualDecimal(z);
  expect(new BigDecimal(x).sub(z).div(y).isInt()).toBe(true);
});

test("division by zero", () => {
  const e = () => new BigDecimal("1").rem("0");
  expect(e).toThrowErrorMatchingInlineSnapshot(`"Division by zero"`);
});
