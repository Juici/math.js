import { BigDecimal } from "../../BigDecimal";

test("neg", () => {
  const cases: Array<[string, string]> = [
    ["-1", "1"],
    ["0", "0"],
    ["0.5", "-0.5"],
  ];

  for (const [a, b] of cases) {
    const x = new BigDecimal(a);
    const y = new BigDecimal(b);
    expect(x.neg()).toEqualDecimal(y);
    expect(y.neg()).toEqualDecimal(x);
  }
});
