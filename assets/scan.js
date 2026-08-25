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
  0x2800: ["Braille pattern blank", "Renders as blank space. A common way to pad hidden text."],
  0x3164: ["Hangul filler", "Invisible. Passes as a character in names that reject spaces."],
  0x115f: ["Hangul choseong filler", "Invisible."],
  0x1160: ["Hangul jungseong filler", "Invisible."],
  0xffa0: ["Halfwidth hangul filler", "Invisible."],
  0x2061: ["Function application", "Invisible mathematical operator."],
  0x2062: ["Invisible times", "Invisible mathematical operator."],
  0x2063: ["Invisible separator", "Invisible mathematical operator."],
  0x2064: ["Invisible plus", "Invisible mathematical operator."],
  0x034f: ["Combining grapheme joiner", "Invisible. Splits text without a visible break."],
};

// U+FE0F (variation selector-16) is deliberately absent: it appears in almost every
// emoji, so listing it would flag ordinary text and bury the findings that matter.

const BIDI = {
  // U+200E/200F are the pair used in the filename-extension spoof — "invoice<RLM>gpj.exe"
  // renders as "invoice exe.jpg". Missing them meant the tool returned "Plain text" on
  // the single attack it most exists to catch.
  0x200e: "Left-to-right mark",
  0x200f: "Right-to-left mark",
  0x061c: "Arabic letter mark",
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
  // Uppercase siblings of lowercase entries already listed above — their absence was an
  // oversight, not a decision.
  Ј: "J", І: "I", Ѕ: "S", Ԛ: "Q", Ԝ: "W", Ѵ: "V",
  ԁ: "d", һ: "h", ӏ: "l", ԛ: "q", ԝ: "w", ѵ: "v", ҫ: "c", ә: "e",
  ϲ: "c", ϳ: "j", γ: "y", ϱ: "p", ϐ: "b",
  օ: "o", ա: "w", գ: "q", ղ: "n",
  ａ: "a", ｅ: "e", ｏ: "o", ｐ: "p", ｃ: "c", ｉ: "i", ｌ: "l",
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
