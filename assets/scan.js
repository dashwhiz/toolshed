// Character-level scanning, shared by the hidden-characters tool and the injection scan.
// Everything here is mechanical: it reports what is present, never what it means.

const INVISIBLE = {
  0x200b: ["Zero-width space", "Splits a word invisibly. Breaks search and comparison."],
  0x200c: ["Zero-width non-joiner", "Invisible. Legitimate in some scripts, otherwise noise."],
  0x200d: ["Zero-width joiner", "Invisible. Joins emoji sequences, also used to hide text."],
  0x2060: ["Word joiner", "Invisible."],
  0xfeff: ["Byte order mark", "Invisible. Often a stray artefact of a file conversion."],
  0x00ad: ["Soft hyphen", "Invisible until the line wraps."],
  0x180e: ["Mongolian vowel separator", "Invisible."],
};

const BIDI = {
  0x202a: "Left-to-right embedding",
  0x202b: "Right-to-left embedding",
  0x202c: "Pop directional formatting",
  0x202d: "Left-to-right override",
  0x202e: "Right-to-left override",
  0x2066: "Left-to-right isolate",
  0x2067: "Right-to-left isolate",
  0x2068: "First strong isolate",
  0x2069: "Pop directional isolate",
};

const CONFUSABLE = {
  а: "a", е: "e", о: "o", р: "p", с: "c", у: "y", х: "x", і: "i", ѕ: "s", ј: "j",
  А: "A", В: "B", Е: "E", К: "K", М: "M", Н: "H", О: "O", Р: "P", С: "C", Т: "T", Х: "X",
  ο: "o", ν: "v", ρ: "p", α: "a", ε: "e", ι: "i", κ: "k", Α: "A", Β: "B", Ε: "E",
  Ζ: "Z", Η: "H", Ι: "I", Κ: "K", Μ: "M", Ν: "N", Ο: "O", Ρ: "P", Τ: "T", Υ: "Y", Χ: "X",
};

const TYPOGRAPHIC = {
  "‘": "'", "’": "'", "“": '"', "”": '"',
  "–": "-", "—": "-", "…": "...", "−": "-", " ": " ", " ": " ",
};

const codeName = (cp) => "U+" + cp.toString(16).toUpperCase().padStart(4, "0");

/**
 * Returns { total, groups } where each group is one kind of finding with its
 * character positions. Purely descriptive.
 */
export function scanText(text) {
  const groups = new Map();
  const add = (key, level, label, detail, char, index) => {
    if (!groups.has(key)) groups.set(key, { level, label, detail, count: 0, samples: [] });
    const g = groups.get(key);
    g.count++;
    if (g.samples.length < 5) g.samples.push({ char, index });
  };

  let index = 0;
  for (const char of text) {
    const cp = char.codePointAt(0);

    if (cp >= 0xe0000 && cp <= 0xe007f) {
      // Unicode tag characters: a full invisible ASCII alphabet. Almost the only
      // reason to use them today is smuggling text past a human reader.
      add("tag", "bad", "Unicode tag characters",
        "an invisible copy of ASCII. Text can be hidden here that a person cannot see at all.",
        char, index);
    } else if (INVISIBLE[cp]) {
      add("inv" + cp, "warn", INVISIBLE[cp][0] + ` (${codeName(cp)})`, INVISIBLE[cp][1], char, index);
    } else if (BIDI[cp]) {
      add("bidi" + cp, "bad", BIDI[cp] + ` (${codeName(cp)})`,
        "reorders how the text renders, so what you read can differ from what is stored.", char, index);
    } else if (CONFUSABLE[char]) {
      add("conf", "bad", "Look-alike letters from another alphabet",
        "characters that render like Latin letters but are not. The classic way to fake a familiar name.", char, index);
    } else if (TYPOGRAPHIC[char]) {
      add("typo", "info", "Typographic punctuation",
        "smart quotes, dashes or non-breaking spaces. Harmless in prose, breaks code and config.", char, index);
    } else if (cp < 0x20 && char !== "\n" && char !== "\t" && char !== "\r") {
      add("ctrl", "warn", "Control characters", "non-printing characters in the text.", char, index);
    }
    index += char.length;
  }

  return {
    total: [...groups.values()].reduce((n, g) => n + g.count, 0),
    groups: [...groups.values()],
  };
}

/** Strips everything scanText flags as invisible, and normalises typographic punctuation. */
export function cleanText(text) {
  let out = "";
  for (const char of text) {
    const cp = char.codePointAt(0);
    if (cp >= 0xe0000 && cp <= 0xe007f) continue;
    if (INVISIBLE[cp] || BIDI[cp]) continue;
    if (CONFUSABLE[char]) { out += CONFUSABLE[char]; continue; }
    if (TYPOGRAPHIC[char]) { out += TYPOGRAPHIC[char]; continue; }
    out += char;
  }
  return out;
}

export { codeName };
