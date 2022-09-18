import { ParseDecimalError } from "../errors";

test("error name", () => {
  expect(new ParseDecimalError()).toMatchInlineSnapshot(`[ParseDecimalError]`);
});
