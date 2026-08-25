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

## When a tool earns a page

The bar is not "is this useful" — it is "would I open this instead of asking an AI". A page
wins when at least one of these holds:

1. **It handles a secret.** A JWT, a certificate, a base64'd credential. Pasting those into a
   chat is a bad habit; a local page removes the excuse.
2. **You do it constantly.** Opening a chat is more friction than the task itself.
3. **The input is bulk.** Thousands of lines cost tokens and patience.
4. **It needs live external data.** DNS, RDAP, IP ownership — a model cannot fetch these.
5. **It is interactive.** Nudge a value and watch it change.

An AI wins when the job is one-off, wants judgement or an explanation, carries no secret, and
the input is small. Anything scoring nothing on the list above belongs in Parked.

## Check something out there

Needs the network. Only uses endpoints that send `Access-Control-Allow-Origin: *`.

| Tool | Slug | Status | Notes |
| --- | --- | --- | --- |
| Website trust check | `site-check` | on-portfolio | Flagship. URL in → domain age, registrar, DNS, host, plain-English verdict with the red flags named. Owns IP/ASN detail too — owner, network, datacenter vs residential — rather than a second page for it |
| DNS records | `dns` | on-portfolio | A/AAAA/MX/NS/TXT/CAA/SOA over DoH, pick resolver |
| Email spoofability | `email-auth` | on-portfolio | SPF + DMARC + DKIM + MX for a domain — could someone forge mail from it? |

## Inspect something you were sent

Fully offline. Nothing leaves the browser — say so on every page.

| Tool | Slug | Status | Notes |
| --- | --- | --- | --- |
| Link inspector | `link` | on-portfolio | Punycode/IDN homograph detection, unwrap Outlook/Proofpoint safelinks, explain tracking params |
| Hidden characters | `unicode` | on-portfolio | Zero-width, homoglyphs, smart quotes, NBSP — catches phishing and broken code |
| JWT decoder | `jwt` | idea | Decode only, never leaves the browser |
| Certificate decoder | `cert` | idea | Paste PEM → issuer, subject, SANs, validity |
| Prompt injection scan | `injection-scan` | on-portfolio | Paste content an agent is about to read. See the note below before building |

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
| JSON formatter | `json` | on-portfolio | Two panes. Repairs broken JSON, keeps long numbers exact, warns on duplicate keys |
| Timestamp converter | `timestamp` | idea | Epoch ⇄ human, timezone aware |
| ID generator | `ids` | idea | UUID v4, ULID, nanoid, bulk + copy |
| Hash generator | `hash` | idea | SHA-1/256/512 via WebCrypto (no MD5 — WebCrypto has none) |
| Encode/decode bench | `encode` | idea | Base64, URL, HTML entities. Text and file input |
| Text bench | `text` | idea | Case convert, sort, dedupe, trim, count — bulk lines |
| Colour contrast | `contrast` | idea | WCAG AA/AAA, suggest nearest passing shade |

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

- Cron explainer — the clearest loss to just asking. One-off, wants an explanation rather
  than an answer, no secret, tiny input. A model says what it means *and* why.
- IP & ASN lookup — a real question, but a sub-feature of `site-check`, which already reports
  hosting. Folded in there rather than a second page to remember.
- HTTP status reference, query string builder, duration/bytes humanizer — a search or one
  devtools line beats them. Not worth a page.
- SVG optimiser — real optimisation is SVGO. A naive version you can't trust is worse than none.
- Regex tester, text diff, markdown preview, flexbox playground — strong incumbents, and each
  is a heavy dep or a whole algorithm for little edge.
- JSON ⇄ YAML, .env ⇄ JSON, image → data URI, test data generator — fine tools, no urgency.
  Revisit once the list above is shipped.

## Next up

Build in this order when nothing is `building`. Ordered by how badly a page beats asking,
not by how interesting the tool is:

1. `jwt` — secret-bearing and frequent. The archetype for this collection.
2. `encode` — highest frequency on the list, and base64 is how credentials travel.
3. `timestamp` — ten times a day, zero judgement needed.
4. `ids` — `crypto.randomUUID()` is a CSPRNG; a model-generated UUID only looks random.
5. `text` — the bulk case.
6. `contrast` — the interactive case.
7. `hash` — right for files you would never upload to a chat, but infrequent.
8. `cert` — same secret argument as `jwt`, much rarer.

## Rules

- One commit per meaningful increment. Never pad, never split a change to raise the count, never commit empty.
- Verify a tool works in the browser before marking it `shipped`.
- Follow [`DESIGN.md`](DESIGN.md). No emoji, no in-page nav, one background colour.
- Shipped tools get an entry in the `TOOLS` array in `index.html`.
- The portfolio carries ONE `shipped` entry for Toolshed as a whole, never one per tool.
  When a tool ships, do not add an entry. Update the existing Toolshed blurb only if the new
  tool changes what the collection is for, keep its `stack` list to what is actually used,
  push that repo, then mark the row `on-portfolio`.
