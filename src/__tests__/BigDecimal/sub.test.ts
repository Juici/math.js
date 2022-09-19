import { BigDecimal } from "../../BigDecimal";

test.each([
  { x: "1", y: "1", z: "0" },
  { x: "1", y: "-1", z: "2" },
  { x: "-1", y: "-1", z: "0" },
  { x: "0.1", y: "0.2", z: "-0.1" },
  { x: "0.01", y: "-2", z: "2.01" },
])("$x - $y = $z", ({ x, y, z }) => {
  expect(new BigDecimal(x).sub(y)).toEqualDecimal(z);
  expect(new BigDecimal(x).sub(z)).toEqualDecimal(y);
});
