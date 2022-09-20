import { BigDecimal } from "../../BigDecimal";
import { ParseDecimalError } from "../../errors";

describe("new BigDecimal(digits, scale)", () => {
  test("new BigDecimal(bigint, number)", () => {
    const n = new BigDecimal(-101n, 2);
    expect(n.sign).toBe(-1);
    expect(n.dp).toBe(2);
    expect(n.toString()).toBe("-1.01");
  });

  test("not bigint digits", () => {
    // @ts-expect-error
    const e = () => new BigDecimal(123, 0);
    expect(e).toThrow(TypeError);
    expect(e).toThrowErrorMatchingInlineSnapshot(`"Argument 'digits' must be a bigint"`);
  });

  test("not number scale", () => {
    // @ts-expect-error
    const e = () => new BigDecimal(1n, 0n);
    expect(e).toThrow(TypeError);
    expect(e).toThrowErrorMatchingInlineSnapshot(`"Argument 'scale' must be an integer"`);
  });
});

describe("new BigDecimal(n)", () => {
  describe("new BigDecimal(string)", () => {
    test("valid", () => {
      const n = new BigDecimal("4.20");
      expect(n.sign).toBe(1);
      expect(n.dp).toBe(1);
      expect(n.toString()).toBe("4.2");
    });

    test("empty exponent", () => {
      const e = () => new BigDecimal("1e");
      expect(e).toThrow(ParseDecimalError);
      expect(e).toThrowErrorMatchingInlineSnapshot(`"Cannot parse empty exponent: 1e"`);
    });

    test("invalid exponent", () => {
      const e = () => new BigDecimal("1e1.2");
      expect(e).toThrow(ParseDecimalError);
      expect(e).toThrowErrorMatchingInlineSnapshot(`"Cannot parse integer exponent: 1.2"`);
    });

    test("empty mantissa", () => {
      const e = () => new BigDecimal("e1");
      expect(e).toThrow(ParseDecimalError);
      expect(e).toThrowErrorMatchingInlineSnapshot(`"Cannot parse empty mantissa: e1"`);
    });

    test("invalid digits", () => {
      const e = () => new BigDecimal("xe1");
      expect(e).toThrow(ParseDecimalError);
      expect(e).toThrowErrorMatchingInlineSnapshot(`"Cannot parse integer digits: x"`);
    });
  });

  describe("new BigDecimal(number)", () => {
    test("valid", () => {
      const n = new BigDecimal(-6.9);
      expect(n.sign).toBe(-1);
      expect(n.dp).toBe(1);
      expect(n.toString()).toBe("-6.9");
    });

    test("safe integer", () => {
      const n = new BigDecimal(100);
      expect(n.sign).toBe(1);
      expect(n.dp).toBe(0);
      expect(n.toString()).toBe("100");
    });

    test("not safe integer", () => {
      const n = new BigDecimal(1e100);
      expect(n.sign).toBe(1);
      expect(n.dp).toBe(0);
      expect(n.toString()).toBe(`1${"0".repeat(100)}`);
    });

    test("not finite", () => {
      const e = () => new BigDecimal(NaN);
      expect(e).toThrow(RangeError);
      expect(e).toThrowErrorMatchingInlineSnapshot(`"BigDecimal must be finite: NaN"`);
    });
  });

  test("new BigDecimal(bigint)", () => {
    const n = new BigDecimal(42n);
    expect(n.sign).toBe(1);
    expect(n.dp).toBe(0);
    expect(n.toString()).toBe("42");
  });

  test("new BigDecimal(BigDecimalLike)", () => {
    const n = new BigDecimal({ digits: -314n, scale: 2 });
    expect(n.sign).toBe(-1);
    expect(n.dp).toBe(2);
    expect(n.toString()).toBe("-3.14");
  });

  test("invalid", () => {
    // @ts-expect-error
    const e = () => new BigDecimal({});
    expect(e).toThrow(TypeError);
    expect(e).toThrowErrorMatchingInlineSnapshot(
      `"Cannot convert '[object Object]' to a BigDecimal"`,
    );
  });
});

test("zero", () => {
  const n = new BigDecimal("0");
  expect(n.sign).toBe(0);
  expect(n.dp).toBe(0);
  expect(n.toString()).toBe("0");
});

test("postive int", () => {
  const n = new BigDecimal("123");
  expect(n.sign).toBe(1);
  expect(n.dp).toBe(0);
  expect(n.toString()).toBe("123");
});

test("negative int", () => {
  const n = new BigDecimal("-123");
  expect(n.sign).toBe(-1);
  expect(n.dp).toBe(0);
  expect(n.toString()).toBe("-123");
});

test("postive decimal", () => {
  const n = new BigDecimal("123.456789");
  expect(n.sign).toBe(1);
  expect(n.dp).toBe(6);
  expect(n.toString()).toBe("123.456789");
});

test("negative decimal", () => {
  const n = new BigDecimal("-123.456789");
  expect(n.sign).toBe(-1);
  expect(n.dp).toBe(6);
  expect(n.toString()).toBe("-123.456789");
});

test("postive tiny decimal", () => {
  const n = new BigDecimal("1e-100");
  expect(n.sign).toBe(1);
  expect(n.dp).toBe(100);
  expect(n.toString()).toBe(`0.${"0".repeat(99)}1`);
});

test("negative tiny decimal", () => {
  const n = new BigDecimal("-1e-100");
  expect(n.sign).toBe(-1);
  expect(n.dp).toBe(100);
  expect(n.toString()).toBe(`-0.${"0".repeat(99)}1`);
});

test("postive big decimal", () => {
  const n = new BigDecimal("1.23e100");
  expect(n.sign).toBe(1);
  expect(n.dp).toBe(0);
  expect(n.toString()).toBe(`123${"0".repeat(98)}`);
});

test("negative big decimal", () => {
  const n = new BigDecimal("-1.23e100");
  expect(n.sign).toBe(-1);
  expect(n.dp).toBe(0);
  expect(n.toString()).toBe(`-123${"0".repeat(98)}`);
});

test("normalize", () => {
  const n = new BigDecimal("3000");
  expect(n.digits).toBe(3n);
  expect(n.scale).toBe(-3);
  expect(n.sign).toBe(1);
  expect(n.dp).toBe(0);
  expect(n.toString()).toBe("3000");
});
