import { BigDecimal } from "../../BigDecimal";

test.each([
  { x: "1", y: "1", z: "2" },
  { x: "1", y: "-1", z: "0" },
  { x: "-1", y: "-1", z: "-2" },
  { x: "0.1", y: "0.2", z: "0.3" },
  { x: "0.01", y: "-2", z: "-1.99" },
])("$x + $y = $z", ({ x, y, z }) => {
  expect(new BigDecimal(x).add(y)).toEqualDecimal(z);
  expect(new BigDecimal(y).add(x)).toEqualDecimal(z);
});
