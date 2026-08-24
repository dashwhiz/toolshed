# Roadmap

Source of truth for what gets built next. Statuses: `idea` → `building` → `shipped` → `on-portfolio`.

Every tool is a single static page plus the shared `assets/`: no build step, no backend,
no API keys, no accounts. Look and behaviour are governed by [`DESIGN.md`](DESIGN.md).
Live at `https://dashwhiz.github.io/toolshed/tools/<slug>/`.

## What this is for

One place to answer "is this real, and what is it?" without googling a tool, finding a site,
pasting a URL into it, and doing it again for the next question. The tools that touch the
network use public endpoints that allow browser calls and need no key. The rest never send
anything anywhere — which is the point, because you paste tokens and certs into them.

## Check something out there

Needs the network. Only uses endpoints that send `Access-Control-Allow-Origin: *`.

| Tool | Slug | Status | Notes |
| --- | --- | --- | --- |
| Website trust check | `site-check` | on-portfolio | Flagship. URL in → domain age, registrar, DNS, host, plain-English verdict with the red flags named |
| DNS records | `dns` | idea | A/AAAA/MX/NS/TXT/CAA/SOA over DoH, pick resolver |
| Email spoofability | `email-auth` | idea | SPF + DMARC + DKIM + MX for a domain — could someone forge mail from it? |
| IP & ASN lookup | `ip` | idea | Owner, network, country, datacenter vs residential |

## Inspect something you were sent

Fully offline. Nothing leaves the browser — say so on every page.

| Tool | Slug | Status | Notes |
| --- | --- | --- | --- |
| Link inspector | `link` | idea | Punycode/IDN homograph detection, unwrap Outlook/Proofpoint safelinks, explain tracking params |
| Hidden characters | `unicode` | idea | Zero-width, homoglyphs, smart quotes, NBSP — catches phishing and broken code |
| JWT decoder | `jwt` | idea | Decode only, never leaves the browser |
| Certificate decoder | `cert` | idea | Paste PEM → issuer, subject, SANs, validity |
| Prompt injection scan | `injection-scan` | idea | Paste content an agent is about to read. See the note below before building |

### On the injection scan

Paste-only, and it must stay that way: fetching a third party's HTML is blocked by CORS and
there is no keyless endpoint that will do it. Scanning a live URL needs a browser extension
(a content script sees the rendered DOM) or a backend. Build the engine here first — the
extension would be a thin wrapper around the same module, and pasting covers email, issues
and documents, which a URL scanner never could.

Frame it as **"show me what this is hiding"**, never as "detects prompt injection". The
mechanical findings are certain — hidden CSS text, zero-width and Unicode-tag characters,
bidi overrides, comments, `alt`/`title`/`aria-label` text, the gap between rendered and DOM
text. Instruction-shaped language is a separate, clearly weaker signal and must be labelled
as such. A page that returns "clean" on a cleverly worded injection is worse than no page.
Note in `.caveats` that a site can serve the agent different content than it served you.

`unicode` is this tool's engine — build it first and compose.

## Everyday utilities

| Tool | Slug | Status | Notes |
| --- | --- | --- | --- |
| Timestamp converter | `timestamp` | idea | Epoch ⇄ human, timezone aware |
| ID generator | `ids` | idea | UUID v4, ULID, nanoid, bulk + copy |
| Hash generator | `hash` | idea | SHA-1/256/512 via WebCrypto (no MD5 — WebCrypto has none) |
| Encode/decode bench | `encode` | idea | Base64, URL, HTML entities. Text and file input |
| Text bench | `text` | idea | Case convert, sort, dedupe, trim, count — bulk lines |
| Colour contrast | `contrast` | idea | WCAG AA/AAA, suggest nearest passing shade |
| Cron explainer | `cron` | idea | Plain-English + next 5 run times |

## Verified data sources

Checked with a browser `Origin` header on 2026-08-24. Re-check before relying on one.

- `https://dns.google/resolve?name=<d>&type=<t>` — `ACAO: *`, no key. DNS.
- `https://rdap.org/domain/<d>` — `ACAO: *` (through the redirect), no key. Creation date, registrar, status.
- `https://ipwho.is/<ip>` — `ACAO: *`, no key. ASN, org, country.
- `https://crt.sh/?q=<d>&output=json` — **unusable.** No CORS header, and returned 502.

Fetching an arbitrary site's own HTML or headers is blocked by CORS and is not possible
without a backend. Do not promise it on any page.

## Parked

Cut deliberately. Recorded so they don't get re-added by accident.

- HTTP status reference, query string builder, duration/bytes humanizer — a search or one
  devtools line beats them. Not worth a page.
- SVG optimiser — real optimisation is SVGO. A naive version you can't trust is worse than none.
- Regex tester, text diff, markdown preview, flexbox playground — strong incumbents, and each
  is a heavy dep or a whole algorithm for little edge.
- JSON ⇄ YAML, .env ⇄ JSON, image → data URI, test data generator — fine tools, no urgency.
  Revisit once the list above is shipped.

## Next up

Build order when nothing is `building`: `unicode`, then `injection-scan`, then `dns`.
The rest of the table is unordered.

## Rules

- One commit per meaningful increment. Never pad, never split a change to raise the count, never commit empty.
- Verify a tool works in the browser before marking it `shipped`.
- Follow [`DESIGN.md`](DESIGN.md). No emoji, no in-page nav, one background colour.
- Shipped tools get an entry in the `TOOLS` array in `index.html`.
- When a tool ships, add it to `shipped` in the portfolio's `content/profile.ts` and push that repo too, then mark the row `on-portfolio`.
