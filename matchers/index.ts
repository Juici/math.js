import { expect } from "@jest/globals";
import {
  EXPECTED_COLOR,
  RECEIVED_COLOR,
  ensureNoExpected,
  matcherErrorMessage,
  matcherHint,
  printReceived,
} from "jest-matcher-utils";

import { BigDecimal } from "../src/BigDecimal";

import { printWithType } from "./print";

import type { DecimalValue } from "../src/BigDecimal";
import type { MatcherHintOptions } from "jest-matcher-utils";

expect.extend({
  toEqualDecimal(received: unknown, expected: DecimalValue) {
    const matcherName = "toEqualDecimal";
    const options: MatcherHintOptions = {
      isNot: this.isNot,
      promise: this.promise,
    };
    expected = new BigDecimal(expected);

    if (!(received instanceof BigDecimal)) {
      return {
        pass: false,
        message: () =>
          matcherErrorMessage(
            matcherHint(matcherName, undefined, undefined, options),
            `${RECEIVED_COLOR("received")} value must be a BigDecimal`,
            printWithType("Received", received, printReceived),
          ),
      };
    }

    const pass = received.eq(expected);
    const message = pass
      ? () =>
          // eslint-disable-next-line prefer-template
          matcherHint(matcherName, undefined, undefined, options) +
          "\n\n" +
          `Expected: ${EXPECTED_COLOR(expected)}`
      : () =>
          // eslint-disable-next-line prefer-template
          matcherHint(matcherName, undefined, undefined, options) +
          "\n\n" +
          `Expected: ${EXPECTED_COLOR(expected)}\n` +
          `Received: ${RECEIVED_COLOR(received)}`;

    return { pass, message };
  },

  toBeEmpty(received: unknown, expected: void) {
    const matcherName = "toBeEmpty";
    const options: MatcherHintOptions = {
      isNot: this.isNot,
      promise: this.promise,
    };
    ensureNoExpected(expected, matcherName, options);

    if (
      received === null ||
      received === undefined ||
      typeof (received as never)[Symbol.iterator] !== "function"
    ) {
      return {
        pass: false,
        message: () =>
          matcherErrorMessage(
            matcherHint(matcherName, undefined, undefined, options),
            `${RECEIVED_COLOR("received")} value must be an iterable`,
            printWithType("Received", received, printReceived),
          ),
      };
    }

    const pass = (received as Iterable<unknown>)[Symbol.iterator]().next().done === true;
    const message = pass
      ? () =>
          // eslint-disable-next-line prefer-template
          matcherHint(matcherName, undefined, undefined, options) +
          "\n\n" +
          `Expected ${RECEIVED_COLOR("received")} to not be empty`
      : () =>
          // eslint-disable-next-line prefer-template
          matcherHint(matcherName, undefined, undefined, options) +
          "\n\n" +
          `Received: ${printReceived(received)}`;

    return { pass, message };
  },
});
