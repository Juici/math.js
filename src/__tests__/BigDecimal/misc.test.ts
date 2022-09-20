import { inspect } from "util";

import { BigDecimal } from "../../BigDecimal";

test("Symbol.toStringTag", () => {
  expect(new BigDecimal("1")[Symbol.toStringTag]).toBe("BigDecimal");
  expect(Object.prototype.toString.call(new BigDecimal("1"))).toMatchInlineSnapshot(
    `"[object BigDecimal]"`,
  );
});

describe("Symbol.toPrimitive", () => {
  test("string", () => {
    expect(new BigDecimal("1.23")[Symbol.toPrimitive]("string")).toBe("1.23");
    expect(`${new BigDecimal("-42")}`).toBe("-42");
  });

  test("number", () => {
    expect(new BigDecimal("1.23")[Symbol.toPrimitive]("number")).toBe(1.23);
    expect(+new BigDecimal("-42")).toBe(-42);
  });

  test("default", () => {
    expect(new BigDecimal("1.23")[Symbol.toPrimitive]("default")).toBe("1.23");
    // eslint-disable-next-line prefer-template
    expect(new BigDecimal("-42") + "").toBe("-42");
  });

  test("invalid hint", () => {
    // @ts-expect-error
    const e = () => new BigDecimal("1")[Symbol.toPrimitive]("invalid");
    expect(e).toThrowErrorMatchingInlineSnapshot(`"Invalid hint: invalid"`);
  });
});

test("nodejs.util.inspect.custom", () => {
  expect(inspect(new BigDecimal("3.1"), { colors: false })).toBe("3.1");
});

test("instanceof", () => {
  expect(new BigDecimal("3.1")).toBeInstanceOf(BigDecimal);
  expect("3.1").not.toBeInstanceOf(BigDecimal);
});
