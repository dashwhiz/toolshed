# Log

Newest last. One entry per working session, so the next session knows where this stopped.

## 2026-08-24
Repo created, Pages enabled, roadmap drafted with 20 candidate tools. No tools built yet.
Next: pick the first `idea` and promote it to `building`.

## 2026-08-24 (later)
Reworked the roadmap around one idea: answering "is this real, and what is it?" in one
place. Cut the filler (HTTP status list, query string builder, humanizer, SVG optimiser)
and added the tools that earn their page. Verified first that RDAP, Google DoH and ipwho.is
all send `Access-Control-Allow-Origin: *`, which is what lets a static page do this at all;
crt.sh does not, so it is out.

Shipped `site-check`. Two real bugs found and fixed while testing: the punycode decoder
accepted characters below `0` and turned garbage into plausible-looking Unicode, and the
mail lookups ran against the typed hostname, so any `www.` URL was wrongly flagged as
accepting no mail — the BBC failed its own check.

Added a shared design layer (`assets/`) and `DESIGN.md` to enforce it: one background
colour, self-hosted Roboto, Lucide icons, no emoji, no in-page nav, sticky footer.

Decided against Next.js. Native ES modules already give the shared layer; a bundler would
cost the auditability that is the whole pitch for a JWT or certificate decoder.

Deep links had no way home once the in-page back link was removed, so the shared footer
now carries the wordmark on any page below the root. Browser back was never broken — the
search calls `preventDefault()`, so it adds no history entry.

`site-check` is on the portfolio; portfolio build and lint both exit 0.

## 2026-08-24 (evening)
Four tools shipped: `unicode`, `injection-scan`, `dns`, `email-auth`. All four are
`on-portfolio`; portfolio build and lint exit 0.

Hoisted the shared layer first, which was the right order — `site-check` dropped from 419
to 248 lines and the four new tools reuse it rather than copying. `assets/domain.js` holds
DoH, RDAP and the punycode decoder; `assets/scan.js` holds character detection;
`assets/toolshed.js` gained `row`, `renderVerdict` and `renderFindings`.

`injection-scan` deliberately splits its output in two: mechanically certain findings
(hidden CSS, invisible characters, comments, attribute text) and weaker language patterns,
labelled as such. Verified it does not cry wolf — benign HTML and plain prose both come back
clean, and documentation legitimately containing "ignore all previous instructions" reads as
"instruction-like language, nothing concealed" rather than an attack.

Two real bugs caught by testing rather than reading. The DKIM check treated an empty `p=` as
a published key when it is the convention for a *revoked* one, so `example.com` reported keys
at all seventeen probed selectors — it actually publishes revocations at every name. And the
injection scanner said "a alt attribute".

Mobile verified at 360 and 390px across all six pages: nothing scrolls sideways, buttons take
the full row once they wrap, card and data grids collapse to one column.

## 2026-08-25
Fixed two things reported from an iPhone. Submit buttons were live on an empty field, so
pressing Check on a blank form returned "That does not look like a domain" — which then sat
there looking like a rejection of whatever was typed next. They are now disabled until the
field has non-whitespace content, via `bindSubmitEnabled` in `assets/toolshed.js`. The
in-flight path calls the returned sync function instead of blindly re-enabling.

Also killed the pale yellow iOS autofill background. `background-color` cannot override it;
an inset `-webkit-box-shadow` can, so the single-background rule survives.

Confirmed the reported input was never broken: `admin@unicorn.com` parses to `unicorn.com`
and checks fine. The stale error message was the empty-click bug.

Both rules are now in DESIGN.md.

Then shipped `link`, the link inspector. It peels Microsoft SafeLinks, Proofpoint v2 and v3,
Barracuda and Google redirects, plus any generic `url=` style parameter, up to eight layers
deep. Reuses `toUnicode` for punycode and `scanText` for look-alike letters rather than
restating either.

The distinction worth keeping: tracking parameters are split into campaign attribution
(`utm_*`, `gclid`) and ones that identify the recipient personally (`mc_eid`, `_hsenc`,
`vero_id`). Only the second kind confirms that *you* opened the message, and that is the
one people care about.

Verified against the credentials trick (`apple.com@203.0.113.9` correctly resolves to the
IP, not the visible name), a seven-level subdomain, Proofpoint v3, plain http, a shortener,
and ordinary links which come back clean. Bare domains are accepted like the sibling tools,
while genuine non-links are still rejected. Mobile clean at 360 and 390 with a very long
wrapped URL on screen.

It cannot follow redirects — CORS forbids the request — so a shortener's real destination
stays unknown. That is stated first in the caveats rather than buried.

`link` is on-portfolio; portfolio build and lint exit 0. Next: `jwt`, then `ip`, then `cert`.

Collapsed the portfolio's `shipped` list from six per-tool entries down to one Toolshed
entry linking to the collection. Six near-identical rows, all pointing at the same repo,
crowded the section without saying more than one row would.

The rule in ROADMAP.md and the daily prompt both said to add an entry per tool, so both were
corrected — otherwise the next run would have quietly undone this.

Tools now run only when their button is pressed. `link`, `injection-scan` and `unicode` were
re-running on every keystroke, so a verdict could be rendered against half-typed input — the
worst possible behaviour in a tool someone consults about trust. `unicode` had no button at
all and gained one. Editing a field after a result now invalidates it rather than leaving a
verdict on screen that describes different text; `bindSubmitEnabled` takes an `onEdit`
callback so the rule lives in one place. Recorded in DESIGN.md.

Dropped the "developer utilities" framing from the site title, the meta description, the
README and the portfolio blurb. These get used for questions anyone can have — is this site
real, where does this link go — and describing them as developer tooling undersold who they
are for.

Footer no longer links out to the portfolio. It now carries Toolshed, Source, What's next
(the roadmap) and Report a problem (issues) — all pointing back into this project, which is
what a visitor standing on one of these pages would actually want next. "What's next" also
explains the SOON cards on the landing page, which previously had nothing behind them.

## 2026-08-25 (later)
Shipped `json`, a two-pane formatter. Paste left, read right.

Wrote a tolerant parser rather than calling `JSON.parse`, which buys three things that
parser cannot give: long numbers keep their exact digits (`JSON.parse` silently rounds
900719925474099321 to ...300), duplicate keys are reported instead of the earlier value
vanishing without trace, and a syntax error reports the line and column it actually failed
at. It also repairs single quotes, unquoted keys, trailing commas and comments.

Double-encoded input is unwrapped up to five layers, and the result is kept only if it
reaches an object or array — so a document that is legitimately just a string is returned
untouched. The first version got this wrong: it trimmed surrounding text before unwrapping,
which ate the outer quotes and left the escapes behind as literal characters.

Highlighting builds one HTML string and is skipped above 300k characters, because the usual
node-per-token approach is what makes other formatters lock up a tab on a large file.

Two-pane tools opt into `<main class="wide">` at 72rem, footer included so the rule lines up.
Everything else stays at reading width.

Footer reworked again: a short paragraph about what this is, then the links. A bare row of
links was correct and dull.

Note for the next session: the local server caches aggressively during editing. If a change
does not appear, serve on a new port rather than trusting a reload.

Next: `jwt`, then `ip`, then `cert`.

