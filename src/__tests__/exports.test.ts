import * as index from "..";
import { BigDecimal } from "../BigDecimal";
import { ParseDecimalError } from "../errors";

const valid = new Map<keyof typeof index, unknown>([
  ["BigDecimal", BigDecimal],
  ["ParseDecimalError", ParseDecimalError],
]);

test.each([...valid.entries()])("%s", (name, expected) => {
  // eslint-disable-next-line import/namespace
  expect(index[name]).toBe(expected);
});

test("no extra exports", () => {
  const extra = (Object.keys(index) as Array<keyof typeof index>).filter(
    (name) => !valid.has(name),
  );
  expect(extra).toBeEmpty();
});
