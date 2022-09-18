import type { DecimalValue } from "../src/BigDecimal";

interface CustomMatchers<R = unknown> {
  /**
   * Used to check that an iterable is empty.
   */
  toBeEmpty(): R;
  /**
   * Used to check that a `BigDecimal` has the expected value.
   */
  toEqualDecimal(expected: DecimalValue): R;
}

declare global {
  /* eslint-disable @typescript-eslint/no-empty-interface */
  namespace jest {
    interface Expect extends CustomMatchers {}
    interface Matchers<R> extends CustomMatchers<R> {}
    interface InverseAsymmetricMatchers extends CustomMatchers {}
  }
  /* eslint-enable @typescript-eslint/no-empty-interface */
}
