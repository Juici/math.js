import { setHasInstance } from "../util";

/**
 * An error parsing a decimal from a string.
 */
export class ParseDecimalError extends Error {}
ParseDecimalError.prototype.name = "ParseDecimalError";

setHasInstance(ParseDecimalError);
