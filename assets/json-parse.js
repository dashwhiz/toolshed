// A forgiving JSON reader, shared by the tools that have to show people what a document
// actually contains. JSON.parse is not enough for that: it rounds long numbers to the
// nearest double without saying so, and it drops duplicate keys silently. Both are
// things a reader needs told about, so this keeps number text verbatim and records the
// duplicates it sees.

// Numbers are kept as their original text so a 19-digit id survives a round trip.
// JSON.parse would silently round it to the nearest double.
export class RawNumber {
  constructor(raw) { this.raw = raw; }
}

/** Trims narrative text around the first complete object or array. */
export function extractBody(text) {
  const start = text.search(/[{[]/);
  if (start < 0) return { text, changed: false };
  const open = text[start];
  const close = open === "{" ? "}" : "]";
  const end = text.lastIndexOf(close);
  if (end <= start) return { text, changed: false };
  const body = text.slice(start, end + 1);
  return { text: body, changed: body.length !== text.trim().length };
}

export function parseTolerant(source) {
  let i = 0;
  const repairs = new Set();
  const duplicates = [];
  const bigNumbers = [];
  let maxDepth = 0;
  let keyCount = 0;

  const fail = (message) => {
    const err = new Error(message);
    err.index = i;
    throw err;
  };
  const ws = () => {
    while (i < source.length) {
      if (/\s/.test(source[i])) { i++; continue; }
      // Comments are not JSON, but logs and config files are full of them.
      if (source[i] === "/" && source[i + 1] === "/") {
        while (i < source.length && source[i] !== "\n") i++;
        repairs.add("removed comments");
        continue;
      }
      if (source[i] === "/" && source[i + 1] === "*") {
        const end = source.indexOf("*/", i + 2);
        i = end < 0 ? source.length : end + 2;
        repairs.add("removed comments");
        continue;
      }
      break;
    }
  };

  function quoted(quote) {
    i++;
    let out = "";
    while (i < source.length && source[i] !== quote) {
      if (source[i] === "\\") {
        const next = source[i + 1];
        i += 2;
        if (next === "n") out += "\n";
        else if (next === "t") out += "\t";
        else if (next === "r") out += "\r";
        else if (next === "b") out += "\b";
        else if (next === "f") out += "\f";
        else if (next === "u") {
          const hex = source.slice(i, i + 4);
          // parseInt("ZZZZ", 16) is NaN, and fromCharCode(NaN) is a NUL byte —
          // a malformed escape used to become an invisible character silently.
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) fail("Invalid \\u escape: \\u" + hex);
          out += String.fromCharCode(parseInt(hex, 16));
          i += 4;
        }
        else out += next;
      } else {
        out += source[i++];
      }
    }
    if (i >= source.length) fail("A quoted string is never closed");
    i++;
    if (quote === "'") repairs.add("single quotes to double");
    return out;
  }

  function bareword() {
    const start = i;
    let depth = 0;
    while (i < source.length) {
      const c = source[i];
      if (depth === 0 && (c === "," || c === "}" || c === "]" || c === ":")) break;
      if (c === "{" || c === "[") depth++;
      if (c === "}" || c === "]") depth--;
      i++;
    }
    return source.slice(start, i).trim();
  }

  function numberOrLiteral(token) {
    if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(token)) {
      // Round-tripping through Number is the only reliable precision check.
      // -0 survives the round trip as "0", which is a formatting quirk rather than
      // a loss of precision, so it must not be reported as one.
      if (!/[.eE]/.test(token) && token !== "-0" && String(Number(token)) !== token) bigNumbers.push(token);
      return new RawNumber(token);
    }
    const lower = token.toLowerCase();
    if (lower === "true") { if (token !== "true") repairs.add("normalised booleans"); return true; }
    if (lower === "false") { if (token !== "false") repairs.add("normalised booleans"); return false; }
    if (lower === "null" || token === "None" || token === "nil" || token === "undefined") {
      if (token !== "null") repairs.add("normalised null");
      return null;
    }
    return undefined;
  }

  function parseValue(depth) {
    maxDepth = Math.max(maxDepth, depth);
    ws();
    if (i >= source.length) fail("The input ends before the value is given");
    const c = source[i];
    if (c === "{") return parseObject(depth);
    if (c === "[") return parseArray(depth);
    if (c === '"' || c === "'") return quoted(c);
    const token = bareword();
    if (!token) fail("Expected a value here");
    const literal = numberOrLiteral(token);
    if (literal !== undefined) return literal;
    repairs.add("quoted bare values");
    return token;
  }

  function parseObject(depth) {
    i++;
    // Prototype-less, so "__proto__" is an ordinary key rather than a setter.
    const out = Object.create(null);
    const seen = new Set();
    ws();
    if (source[i] === "}") { i++; return out; }
    for (;;) {
      ws();
      if (source[i] === "}") { i++; repairs.add("removed trailing commas"); return out; }
      let key;
      if (source[i] === '"' || source[i] === "'") key = quoted(source[i]);
      else { key = bareword(); repairs.add("quoted bare keys"); }
      if (!key) fail("Expected a key here");
      ws();
      if (source[i] !== ":") fail(`Expected ":" after the key "${key}"`);
      i++;
      const value = parseValue(depth + 1);
      if (seen.has(key)) duplicates.push(key);
      seen.add(key);
      keyCount++;
      // A plain object literal treats "__proto__" as the prototype setter, so the
      // key was swallowed and Object.keys never saw it — the tool dropped a key
      // while reporting that nothing had changed.
      Object.defineProperty(out, key, { value, enumerable: true, writable: true, configurable: true });
      ws();
      if (source[i] === ",") { i++; continue; }
      if (source[i] === "}") { i++; return out; }
      if (i >= source.length) fail("The object is never closed");
      fail(`Expected "," or "}" but found ${JSON.stringify(source[i])}`);
    }
  }

  function parseArray(depth) {
    i++;
    const out = [];
    ws();
    if (source[i] === "]") { i++; return out; }
    for (;;) {
      ws();
      if (source[i] === "]") { i++; repairs.add("removed trailing commas"); return out; }
      out.push(parseValue(depth + 1));
      ws();
      if (source[i] === ",") { i++; continue; }
      if (source[i] === "]") { i++; return out; }
      if (i >= source.length) fail("The array is never closed");
      fail(`Expected "," or "]" but found ${JSON.stringify(source[i])}`);
    }
  }

  const value = parseValue(1);
  ws();
  if (i < source.length) fail("There is more text after the end of the value");
  return { value, repairs: [...repairs], duplicates, bigNumbers, maxDepth, keyCount };
}

/** Own serialiser so RawNumber keeps its exact digits. */
export function stringify(value, indent, level = 1) {
  const pad = indent ? "\n" + indent.repeat(level) : "";
  const padEnd = indent ? "\n" + indent.repeat(level - 1) : "";
  if (value instanceof RawNumber) return value.raw;
  if (value === null) return "null";
  if (typeof value === "boolean") return String(value);
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    const parts = value.map((v) => stringify(v, indent, level + 1));
    return indent ? `[${pad}${parts.join("," + pad)}${padEnd}]` : `[${parts.join(",")}]`;
  }
  const keys = Object.keys(value);
  if (!keys.length) return "{}";
  const parts = keys.map((k) => `${JSON.stringify(k)}:${indent ? " " : ""}${stringify(value[k], indent, level + 1)}`);
  return indent ? `{${pad}${parts.join("," + pad)}${padEnd}}` : `{${parts.join(",")}}`;
}
