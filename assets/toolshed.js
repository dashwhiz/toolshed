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

function link(href, text) {
  const a = document.createElement("a");
  a.href = href;
  a.textContent = text;
  return a;
}

function separator() {
  const span = document.createElement("span");
  span.className = "sep";
  span.textContent = "·";
  return span;
}

export function renderFooter() {
  // Sibling of <main>, not a child — the sticky-footer layout needs it on <body>.
  if (document.querySelector(".site-footer")) return;

  const footer = document.createElement("footer");
  footer.className = "site-footer";

  // Deep links (a bookmark, a shared URL) have no history to go back to, so every page
  // below the root carries the wordmark home. Set data-home on <body> to switch it on.
  const home = document.body.dataset.home;
  if (home) footer.append(link(home, "Toolshed"), separator());

  footer.append(
    link("https://github.com/dashwhiz/toolshed", "Source"),
    separator(),
    link("https://alekvel.dev", "Aleksandar Velichkovikj"),
  );
  document.body.append(footer);
}

renderFooter();
