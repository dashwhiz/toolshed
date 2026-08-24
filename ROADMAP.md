# Roadmap

Source of truth for what gets built next. Statuses: `idea` → `building` → `shipped` → `on-portfolio`.

Every tool is a single static page: no build step, no backend, no API keys, no accounts.
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
| Website trust check | `site-check` | idea | Flagship. URL in → domain age, registrar, DNS, host, plain-English verdict with the red flags named |
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

## Rules

- One commit per meaningful increment. Never pad, never split a change to raise the count, never commit empty.
- Verify a tool works in the browser before marking it `shipped`.
- Shipped tools get an entry in the `TOOLS` array in `index.html`.
- When a tool ships, add it to `shipped` in the portfolio's `content/profile.ts` and push that repo too, then mark the row `on-portfolio`.
