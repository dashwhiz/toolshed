# Design rules

Binding for every page in this repo. If a rule here and a habit disagree, the rule wins.
`ROADMAP.md` owns what gets built; this owns how it looks.

## Never

- **No emoji.** Not in the UI, not in headings, not in commit messages, not in docs.
  Use an icon from the set below. If no icon fits, use words.
- **No in-page navigation.** No back links, no breadcrumbs, no "return to index" at the top
  of a page. The browser already has a back button and people know how to use it.
  The one exception is the wordmark in the shared footer, which every page below the root
  carries via `data-home` — a bookmark or a shared link has no history to go back to, and
  without it the only way out is editing the URL by hand. That is site identity, not chrome.
- **No second background colour.** See below.
- **No third-party requests at runtime.** Fonts, icons and scripts are served from this
  repo. A page that promises nothing leaves your browser must not phone home for a font.

## One background

`--bg` is the only background colour in the project. Cards, inputs, panels and footers all
sit directly on it. Separation comes from `--line` borders, spacing and type weight — never
from a lighter or darker fill, and never from a translucent white overlay.

The one exception is `button`, which is a control rather than a surface and carries
`--accent` as its fill.

## Type

Roboto, self-hosted from `assets/fonts/`, used for everything including data. There is no
second family — no monospace stack. Where digits need to line up (addresses, hashes,
timestamps) use `dd.data`, which applies tabular numerals rather than switching font.

Weights: 400 for body, 500 for anything that would otherwise be bold. Never 700.

## Icons

[Lucide](https://lucide.dev) (ISC). Paths live in `ICONS` in `assets/toolshed.js`; call
`icon(name, tone)` to build one. To add an icon, copy its path data from Lucide into that
object — do not link an icon font or a CDN.

Tones map to meaning, not decoration: `good` (accent), `warn`, `bad`, `info` (muted).

## Shared chrome

`assets/toolshed.css` holds every shared style. `assets/toolshed.js` owns the icon set and
renders the footer. A page must not restate either — if a page needs a style that another
page will also need, it belongs in the stylesheet.

Every page ends with the shared footer via `renderFooter()`, which appends it to `<body>` as
a sibling of `<main>` — the sticky-footer layout depends on that, so do not nest it inside
`<main>`. Set `data-privacy` on `<body>` to change the right-hand note; omit it for the
default. Short pages push the footer to the bottom of the viewport; long pages let it flow
below the content. It is never `position: fixed` — it must not overlay scrolling results.

## Structure of a tool page

```
h1                 the tool's name, nothing else
p.lede             one or two lines on what question it answers
form               the input, and a single primary button
p.note#status      live state — what was checked, what failed
#results           hidden until there is something to show
div.caveats        what this tool cannot tell you. Required on anything that judges.
```

## Honesty

Any tool that renders a judgement states its limits on the page, in `.caveats`, in plain
words. A tool that reports "looks fine" on something it cannot actually verify is worse
than no tool, because it converts an unknown into false confidence. Say what was checked,
say what was not, and never imply more certainty than the data supports.
