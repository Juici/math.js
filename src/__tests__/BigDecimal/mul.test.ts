import { BigDecimal } from "../../BigDecimal";

test.each([
  { x: "1", y: "1", z: "1" },
  { x: "1", y: "-1", z: "-1" },
  { x: "-1", y: "-1", z: "1" },
  { x: "0.1", y: "0.2", z: "0.02" },
  { x: "0.01", y: "-2", z: "-0.02" },
])("$x * $y = $z", ({ x, y, z }) => {
  expect(new BigDecimal(x).mul(y)).toEqualDecimal(z);
  expect(new BigDecimal(y).mul(x)).toEqualDecimal(z);
});
