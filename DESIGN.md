# Design rules

Binding for every page in this repo. If a rule here and a habit disagree, the rule wins.
`ROADMAP.md` owns what gets built; this owns how it looks.

## Never

- **No emoji.** Not in the UI, not in headings, not in commit messages, not in docs.
  Use an icon from the set below. If no icon fits, use words.
- **No in-page navigation.** No back links, no breadcrumbs, no "return to index", and no
  wordmark. The browser already has a back button and people know how to use it. There is
  no exception: the footer is one sentence and carries no links at all.
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

`good` is a claim, not a colour. The accent tick is the most glanceable thing on a page and
reads as a pass, so a tool may only use it for something it has actually established. Where
the tool cannot establish the thing a reader cares about — the JWT decoder cannot check a
signature — the best available tone is `info`, however healthy the result looks.

## Shared chrome

`assets/toolshed.css` holds every shared style. `assets/toolshed.js` owns the icon set and
renders the footer. A page must not restate either — if a page needs a style that another
page will also need, it belongs in the stylesheet.

The footer is a single short paragraph and nothing else — no links row. `renderFooter()`
picks the sentence from `data-sends` on `<body>`: a page that names what it contacts gets a
sentence saying so, and a page without the attribute gets one saying nothing leaves the
browser. A blanket privacy claim on every page was false on the tools that do reach the
network, which is why the wording is per-page rather than fixed.

Every page ends with the shared footer via `renderFooter()`, which appends it to `<body>` as
a sibling of `<main>` — the sticky-footer layout depends on that, so do not nest it inside
`<main>`. Short pages push the footer to the bottom of the viewport; long pages let it flow
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

## Wide tools

A tool with two panes side by side opts in with `<main class="wide">`, which widens the
column to 72rem and takes the footer with it so the rule underneath lines up. Everything
else stays at the 46rem reading width — do not widen a page just because it has a lot of
output. Panes collapse to one column below 52rem.

Any block that renders attacker-controlled content needs a bound. `.output` carries a
`max-height` and scrolls; a table built from parsed input caps its rows and says how many
were left out. Without a bound, a large document pushes `.caveats` hundreds of thousands of
pixels down, and limits nobody can reach are not stated on the page.

Both panes are a fixed height and scroll inside themselves. A pane that grows with its
content pushes the buttons and the results off the bottom of the page, so a large document
leaves nothing to press. Textareas carry `resize: none` — a drag handle in the corner is
visual noise, and it contradicts a pane whose height is deliberately fixed.

## Controls

A tool runs when its button is pressed, never while someone types. Live results mean a
verdict rendered against half-typed input, which in a tool people consult about trust is
worse than no result. Editing a field after a result invalidates it — pass an `onEdit`
callback to `bindSubmitEnabled` that hides the results and says which button to press.
A result must never describe anything other than what is currently in the field.

Every control is disabled unless pressing it would do something. Pressing a button and being
told off is a worse experience than the button plainly not being available, and that applies
to all of them, not only the primary one.

`bindSubmitEnabled(field, button, onEdit, isReady)` handles the submit button. `isReady`
decides what usable input means — non-blank by default, but a count field wants an integer and
`hash` wants raw non-empty, because the digest of a space is a real answer. It returns
`{ sync, setBusy }`; use `setBusy` around a request rather than assigning `disabled`, or the
field's own input listener will unlatch it on the next keystroke and let a second request
start.

`bindEnabled(button, canAct)` handles everything else. Copy needs output. Clear needs
something to clear — which is not the same as a non-empty field: a stale error, a visible
result and a loaded file are all things to clear, so the condition is the whole page being
dirty, not the input alone. Buttons that *create* input — Try an example, Use now, Load a
file — are never disabled.

Keep the state in sync by observing what the condition reads rather than remembering to call
sync from every handler. That is how these drift.

Safari and iOS paint autofilled fields a fixed pale yellow that `background-color` cannot
override. The `-webkit-autofill` block in the stylesheet holds the single background with an
inset shadow. Do not add a field style that reintroduces it.

## Honesty

Any tool that renders a judgement states its limits on the page, in `.caveats`, in plain
words. A tool that reports "looks fine" on something it cannot actually verify is worse
than no tool, because it converts an unknown into false confidence. Say what was checked,
say what was not, and never imply more certainty than the data supports.
