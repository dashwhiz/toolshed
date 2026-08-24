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

Next: `link`, then `jwt`, then `ip`.

