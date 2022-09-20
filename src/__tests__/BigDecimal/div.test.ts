import { BigDecimal } from "../../BigDecimal";

test.each([
  { x: "1", y: "2", z: "0.5" },
  { x: "1", y: "-0.5", z: "-2" },
  { x: "-1", y: "-5", z: "0.2" },
  { x: "-1", y: "0.2", z: "-5" },
  { x: "0.1", y: "0.2", z: "0.5" },
  { x: "0.01", y: "-2", z: "-0.005" },
])("$x / $y = $z", ({ x, y, z }) => {
  expect(new BigDecimal(x).div(y)).toEqualDecimal(z);
  expect(new BigDecimal(x).div(z)).toEqualDecimal(y);
});

test("0 / 10 = 0", () => {
  expect(new BigDecimal("0").div("10")).toEqualDecimal("0");
});

test("rounding", () => {
  expect(new BigDecimal("2").div("3", 5)).toEqualDecimal("0.66667");
  expect(new BigDecimal("0.001").div("3", 2)).toEqualDecimal("0");
  expect(new BigDecimal("0.0015").div("3", 3)).toEqualDecimal("0.001");
});

test("division by zero", () => {
  const e = () => new BigDecimal("1").div("0");
  expect(e).toThrowErrorMatchingInlineSnapshot(`"Division by zero"`);
});
