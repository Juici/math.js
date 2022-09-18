import { ParseDecimalError } from "../errors";
import { parseDecimal } from "../parse";

test("valid", () => {
  const cases = [
    { input: "123.456e789", expected: [123456n, -786] },
    { input: "123.456E789", expected: [123456n, -786] },
    { input: "123.456e+789", expected: [123456n, -786] },
    { input: "123.456e-789", expected: [123456n, 792] },
    { input: ".050", expected: [50n, 3] },
    { input: "999", expected: [999n, 0] },
    { input: "999.", expected: [999n, 0] },
    { input: "1.e300", expected: [1n, -300] },
    { input: ".1e300", expected: [1n, -299] },
    { input: "101e-33", expected: [101n, 33] },
    { input: `1.5e${"0".repeat(25)}`, expected: [15n, 1] },
  ];

  for (const { input, expected } of cases) {
    expect(parseDecimal(input)).toEqual(expected);
  }
});

test("invalid chars", () => {
  const invalid = ["r", ",", "?", "<", "j"];
  const valid = ["123", "666.", ".1", "5e1", "7e-3", "0.0e+1"];

  for (const c of invalid) {
    for (const s of valid) {
      for (let i = 0; i < s.length; i++) {
        const input = s.slice(0, i) + c + s.slice(i);

        expect(() => parseDecimal(input)).toThrow(ParseDecimalError);
      }
    }
  }
});

test("missing pieces", () => {
  const cases = ["", " ", ".e", "1e", "e4", "e", ".12e", "321.e", "32.12e+", "12.32e-"];

  for (const input of cases) {
    expect(() => parseDecimal(input)).toThrow(ParseDecimalError);
  }
});
