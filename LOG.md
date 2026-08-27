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

`link` is on-portfolio; portfolio build and lint exit 0. The portfolio needed no change — its single Toolshed entry already covers whatever ships
here, which is the point of collapsing it. Marked `on-portfolio` without touching that repo.

Gave the JSON panes a fixed height that scrolls internally. They had been growing with
their content, so a 6,000-line document made the page 150,000px tall and pushed every button
and the results below the fold. Also removed the drag handle from every textarea.



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

The portfolio needed no change — its single Toolshed entry already covers whatever ships
here, which is the point of collapsing it. Marked `on-portfolio` without touching that repo.

Gave the JSON panes a fixed height that scrolls internally. They had been growing with
their content, so a 6,000-line document made the page 150,000px tall and pushed every button
and the results below the fold. Also removed the drag handle from every textarea.

## 2026-08-26
Shipped `jwt`. The whole tool turns on one distinction: decoding is not verifying. The
signature can only be checked with the issuer's key, which this page does not have and
should never be handed, so nothing in the wording is allowed to imply the token is genuine.
The verdict speaks only about time — "Inside its time window", never "valid" — and a
permanent finding says the signature was not checked rather than leaving it to the caveats
where it could be missed.

Flags `alg: none` and an empty signature as unsigned, warns on no expiry, a lifetime over
thirty days, and an `nbf` still in the future, and notes when the payload carries personal
data, since base64 is encoding rather than encryption and anyone holding the token can read
it.

Hoisted the JSON highlighter out of `tools/json` into `assets/toolshed.js` as `highlightJson`
and `renderJson`, because a JWT payload is JSON too. Second caller, so it moves, per the
rules. Verified the json tool still renders highlighted output afterwards.

Verified against alg none, empty signature, a live token, no expiry, a future nbf, a
400-day lifetime, a `Bearer ` prefix, a quoted token, a UTF-8 payload, two-part input,
five-part JWE, garbage and invalid base64. Console clean, 360 and 390 checked.

Portfolio untouched: its single Toolshed entry already covers this, and the blurb's
"is this website real, where does a link go, what is hidden in text" framing does not
change because a token decoder joined the collection. Marked `on-portfolio` directly.

Next: `encode`, then `timestamp`, then `ids`.

Ran an adversarial review on `jwt` and fixed all twelve Critical and Important findings.
This is now a standing step, recorded in the rules: every tool gets a reviewer subagent told
to break it, before it counts as done.

The Critical one was iconography, not wording. Every string on the page was careful about
decode-versus-verify, but a token inside its dates still rendered an accent-green tick — and
on a tampered token, that tick is the one thing a hurried reader takes away. No branch on
that page is `good` any more; the in-window case is `info` and leads with "signature
unchecked". `good` is a claim, not a colour, and that is now in DESIGN.md.

The rest were wrong output rather than style. The Payload pane printed numbers the token did
not contain, because it was built from the `JSON.parse`d object rather than the raw text —
so a 20-digit `jti` came out rounded, in a repo whose sibling tool advertises preserving
exactly that. Four uncaught `TypeError`s made Decode do nothing at all, silently. A string
`exp` produced "no expiry" on a token that plainly had one. Millisecond timestamps printed
the year 58621 as fact. The 30-day lifetime warning never fired without an `iat`. A token
copied from a wrapped terminal was rejected outright, because padding was computed before
whitespace was stripped. A long header key scrolled the page sideways at 360px. Claims like
`roles` were never tabulated at all.

Hoisted the tolerant reader to `assets/json-parse.js`, which is what lets the decoder report
duplicate claims and exact numbers. Duplicate claims matter here specifically: parsers
disagree about which wins, so two servers can read one token differently.

That hoist also broke the JSON formatter — `extractBody` sat inside the slice I moved and
stopped being defined, so Format threw on every press. My own regression check had passed
because I ran it before the hoist rather than after. Caught it in the console during the
verification sweep; both tools re-exercised end to end afterwards.

Bounded anything built from attacker-controlled input: `.output` scrolls, and the claim and
header tables cap at 100 rows and say how many were left out. An 8,000-claim token made the
page 419,751px tall and put the caveats past any reasonable reach — the same class of bug as
the JSON panes on 2026-08-25, in a new place.

DESIGN.md now describes the footer that actually exists — one paragraph, no links row, with
the sentence chosen by `data-sends`. The blanket privacy claim it replaced was false on the
tools that do reach the network.

## 2026-08-27
Shipped `encode` — base64, base64url, URL escaping and HTML entities, both directions, plus
file to base64. UTF-8 goes through `TextEncoder` in chunks rather than `btoa`, which throws
on anything outside Latin-1; accents, CJK and astral emoji round-trip exactly. Decoded bytes
are only shown as text when they really are UTF-8, otherwise you get the size and what the
first bytes match, because printing bytes as text shows you something they do not say.

The review found no Critical, one bad performance bug and five places the wording claimed
more than the code had established.

The slow one: entity decoding built a whole `DOMParser` document per entity, and the cache
could not help because `&#65;`, `&#065;`, `&#0000065;` are endlessly many distinct valid
keys. A 10 MB paste blocked the main thread for ten seconds and left 1.2 million cache
entries alive for the life of the page. Numeric entities are now arithmetic — including
HTML's windows-1252 remap, so `&#128;` is a euro sign — and named ones resolve in a single
parse for the whole document. Same input now blocks for 850 ms and caches nothing.

The honesty ones all took the same shape: a message asserting something the code had not
checked. `%FF` was reported as "a % not followed by two hex digits" when the escapes were
perfectly well formed and the bytes simply were not UTF-8. A 1,048,577-byte file was refused
with "That file is 1.0 MB. This page stops at 1 MB", which reads as a bug in the tool. Two
dots was enough to call something a JWT, so a base64'd `www.example.com` or `4.19.0` was
announced as a token and the reader sent to a decoder that would fail; a JWT claim now
requires a first segment that actually decodes to JSON naming an algorithm. Four bytes were
enough to assert "The bytes are a PNG image" — the signature is eight, and it now says "the
first bytes match" and requires enough payload to be plausible.

Also fixed: a stale error survived a format change, so the screen said "This is not base64"
while the tool was in URL mode; text typed while a file was being read was silently
overwritten; an empty file got a green pass on a blank pane.

Removed `data-home` from all nine tool pages. `renderFooter` stopped reading it when the
footer became one sentence, and DESIGN.md still described a wordmark that nothing rendered.
The footer stays as it is; the docs now match it.

Note on this machine: `localhost` resolves to IPv6 while `python3 -m http.server` binds IPv4,
so curl hangs with exit 28. Use `127.0.0.1`. Some ports refuse curl but answer fine from
Python and the browser, which is worth remembering before assuming a server failed to start.

`encode` is on-portfolio; the portfolio's single Toolshed entry already covers it and its
blurb already mentions the everyday tools, so that repo was not touched.

Next: `timestamp`, then `ids`, then `text`.

