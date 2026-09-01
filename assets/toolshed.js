// Shared chrome for every page: the icon set and the footer.
// See DESIGN.md. Icons are Lucide (ISC) — never substitute an emoji.

const ICONS = {
  "circle-check": '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  "triangle-alert":
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  "circle-alert":
    '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
};

// tone is one of good, warn, bad, info — or omitted to inherit the text colour.
export function icon(name, tone) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("class", tone ? `icon icon-${tone}` : "icon");
  svg.innerHTML = ICONS[name] || ICONS.info;
  return svg;
}

export function renderFooter() {
  // Sibling of <main>, not a child — the sticky-footer layout needs it on <body>.
  if (document.querySelector(".site-footer")) return;

  const footer = document.createElement("footer");
  footer.className = "site-footer";

  const blurb = document.createElement("p");
  blurb.className = "site-footer-note";

  /*
   * This runs on every page, so a single blanket sentence is always wrong somewhere.
   * It previously claimed "whatever you paste stays in this browser" on site-check,
   * dns and email-auth, which send the domain you type to third parties.
   *
   * Pages that reach the network declare what they contact via data-sends on <body>.
   * Anything without it makes no request at all, and says so.
   */
  const sends = document.body.dataset.sends;
  blurb.textContent = sends
    ? "Every page here is a single file with no accounts, no tracking and no server of " +
      `its own. This one looks the domain up against ${sends}, and sends nothing else.`
    : "Every page here is a single file with no accounts, no tracking and no server — " +
      "what you paste into this one never leaves the browser.";

  footer.append(blurb);
  document.body.append(footer);
}

/* Result rendering, shared by every tool that reports findings. ---------------- */

const TONE_ICON = {
  good: "circle-check",
  warn: "triangle-alert",
  bad: "circle-alert",
  info: "info",
};

// Worst first, so the thing that matters is the thing you read.
const TONE_ORDER = { bad: 0, warn: 1, info: 2, good: 3 };

export function row(dl, term, value, mono) {
  const dt = document.createElement("dt");
  dt.textContent = term;
  const dd = document.createElement("dd");
  dd.textContent = value;
  if (mono) dd.className = "data";
  dl.append(dt, dd);
}

export function renderVerdict(el, tone, title, note) {
  el.className = `verdict verdict--${tone}`;
  const body = document.createElement("div");
  const heading = document.createElement("h2");
  heading.textContent = title;
  const detail = document.createElement("p");
  detail.textContent = note;
  body.append(heading, detail);
  el.replaceChildren(icon(TONE_ICON[tone], tone), body);
}

// findings: [{ level, headline, detail }]
export function renderFindings(list, findings) {
  const sorted = [...findings].sort((a, b) => TONE_ORDER[a.level] - TONE_ORDER[b.level]);
  list.replaceChildren();
  if (!sorted.length) {
    sorted.push({ level: "info", headline: "Nothing notable", detail: "no signal either way." });
  }
  for (const { level, headline, detail } of sorted) {
    const li = document.createElement("li");
    li.className = "finding";
    const text = document.createElement("span");

    // The icon is aria-hidden and the colour carries no meaning to a screen reader,
    // so a warning and a clean result read identically without this.
    const label = document.createElement("span");
    label.className = "sr-only";
    label.textContent = { good: "Good: ", warn: "Warning: ", bad: "Problem: ", info: "Note: " }[level] || "";
    text.append(label);

    const strong = document.createElement("b");
    strong.textContent = headline;
    text.append(strong);
    if (detail) text.append(` — ${detail}`);
    li.append(icon(TONE_ICON[level], level), text);
    list.append(li);
  }
}

export function countBy(findings, level) {
  return findings.filter((f) => f.level === level).length;
}


/**
 * Keeps a submit button disabled while its field is empty, so the only thing a person
 * can do with a blank form is nothing — rather than press it and read an error.
 * Returns the sync function, for re-enabling after an in-flight request finishes.
 */
/**
 * Ties a submit button to its field.
 *
 * `isReady` decides what counts as usable input; the default is "not blank", but a count
 * field or a domain field can say something stricter, and a tool where whitespace is real
 * data can say something looser. Hard-coding trim() here is why three tools grew their own
 * `.disabled` assignments that drifted out of sync.
 *
 * `setBusy` latches the button off for the length of a request. Without a latch the input
 * listener below re-enables it on the next keystroke, which let a second lookup start while
 * the first was still open.
 *
 * @param {HTMLElement} field
 * @param {HTMLButtonElement} button
 * @param {() => void} [onEdit] invalidates whatever is currently on screen
 * @param {(value: string) => boolean} [isReady]
 * @returns {{ sync: () => void, setBusy: (busy: boolean) => void }}
 */
export function bindSubmitEnabled(field, button, onEdit, isReady) {
  const ready = isReady || ((value) => value.trim() !== "");
  let busy = false;
  const sync = () => { button.disabled = busy || !ready(field.value); };
  field.addEventListener("input", () => {
    sync();
    if (onEdit) onEdit();
  });
  sync();
  return {
    sync,
    setBusy(next) { busy = next; sync(); },
  };
}

/**
 * Ties any other control to the question "would pressing this do anything?". Returns the
 * sync function; call it after every state change — a file loaded, a format switched, a
 * result invalidated, a request settled.
 *
 * @param {HTMLButtonElement} button
 * @param {() => boolean} canAct
 * @returns {() => void}
 */
export function bindEnabled(button, canAct) {
  const sync = () => { button.disabled = !canAct(); };
  sync();
  return sync;
}

/** Copies text and says so, including when the browser refuses. */
export async function copyToClipboard(button, text, status, label) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    if (status) {
      status.textContent = "This browser would not let the page write to the clipboard. Select the text and copy it.";
    }
    return false;
  }
  button.textContent = "Copied";
  // Reset early if the button gets disabled in the meantime, so "Copied" is never left
  // sitting on a control that can no longer be pressed.
  const reset = () => { button.textContent = label; };
  const timer = setTimeout(reset, 1500);
  const observer = new MutationObserver(() => {
    if (button.disabled) { clearTimeout(timer); reset(); observer.disconnect(); }
  });
  observer.observe(button, { attributes: true, attributeFilter: ["disabled"] });
  setTimeout(() => observer.disconnect(), 1600);
  return true;
}


/**
 * Colours a formatted JSON string. Builds one HTML string rather than a node per token —
 * the node-per-token approach is what locks a tab up on a large document — and returns
 * plain text above `limit` so a huge payload stays responsive.
 */
export function highlightJson(text, limit = 300000) {
  if (text.length > limit) return { html: null, text };
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = escaped.replace(
    /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match, str, colon, lit, num) => {
      if (str) return `<span class="${colon ? "t-key" : "t-str"}">${str}</span>${colon || ""}`;
      if (lit) return `<span class="t-lit">${lit}</span>`;
      return `<span class="t-num">${num}</span>`;
    },
  );
  return { html, text };
}

/** Writes highlighted JSON into an element, falling back to plain text when too large. */
export function renderJson(el, text, limit) {
  const { html } = highlightJson(text, limit);
  if (html === null) el.textContent = text;
  else el.innerHTML = html;
}

renderFooter();
