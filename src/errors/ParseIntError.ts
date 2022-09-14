import { setHasInstance } from "../util";

/**
 * An error parsing an integer from a string.
 */
export class ParseIntError extends Error {
  override readonly name = "ParseIntError";
}

setHasInstance(ParseIntError);
