import { BigDecimal } from "../../BigDecimal";

test.each([
  { name: "positive", repr: "12.3456789" },
  { name: "negative", repr: "-12.3456789" },
  { name: "zero", repr: "0" },
  { name: "small", repr: "0.00123" },
  { name: "normalized", repr: "100" },
])("$name", ({ repr }) => {
  expect(new BigDecimal(repr).toString()).toBe(repr);
});
