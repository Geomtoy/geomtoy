/**
 * * Memo
 * - `eventName`: single pure event name(property name), like "xChanged", "yChanged" etc.
 * - `eventPattern`: combination of `eventName` with logic operator `&` and `|`, like  "xChanged&yChanged", "centerXChanged|centerYChanged" etc. `eventName` can also be treated as a kind of `eventPattern`, just without logical operators.
 * - `event`, both `eventName` and `eventPattern`.
 *
 * `&` all(and) operator
 * `|` any(or) operator
 *
 */

export const EVENT_PATTERN_ANY_REG = /^(\w+\|){1,}\w+$/i;
export const EVENT_PATTERN_ANY_SPLITTER = "|";
export const EVENT_ANY = "any";

export const EVENT_PATTERN_ALL_REG = /^(\w+\&){1,}\w+$/i;
export const EVENT_PATTERN_ALL_SPLITTER = "&";
export const EVENT_ALL = "all";
