# Roadmap

Source of truth for what gets built next. Statuses: `idea` → `building` → `shipped` → `on-portfolio`.

Every tool is a single static page: no build step, no backend, no API keys, no accounts.
Live at `https://dashwhiz.github.io/toolshed/tools/<slug>/`.

| Tool | Slug | Status | Notes |
| --- | --- | --- | --- |
| JSON ⇄ YAML converter | `json-yaml` | idea | Both directions, validate on paste |
| Cron expression explainer | `cron` | idea | Plain-English + next 5 run times |
| Regex tester | `regex` | idea | Live highlighting, capture groups |
| JWT decoder | `jwt` | idea | Decode only, never leaves the browser — say so on the page |
| Colour contrast checker | `contrast` | idea | WCAG AA/AAA, suggest nearest passing shade |
| ID generator | `ids` | idea | UUID v4, ULID, nanoid, bulk + copy |
| Timestamp converter | `timestamp` | idea | Epoch ⇄ human, timezone aware |
| Base64 encoder/decoder | `base64` | idea | Text and file input |
| Text diff | `diff` | idea | Side by side, word-level |
| Hash generator | `hash` | idea | SHA-1/256/512 via WebCrypto |
| .env ⇄ JSON converter | `env-json` | idea | Both directions |
| HTTP status reference | `http-status` | idea | Searchable, with when-to-use notes |
| Case converter | `case` | idea | camel/snake/kebab/pascal/title, bulk lines |
| SVG optimiser | `svg` | idea | Strip cruft, show bytes saved |
| Test data generator | `testdata` | idea | Names, emails, IBANs, addresses |
| Query string builder | `querystring` | idea | Parse and build |
| Markdown preview | `markdown` | idea | GFM, live |
| Image → data URI | `datauri` | idea | With size warning |
| Flexbox playground | `flexbox` | idea | Visual, copyable CSS |
| Duration & bytes humanizer | `humanize` | idea | 90061s → 1d 1h 1m 1s |

## Rules

- One commit per meaningful increment. Never pad, never split a change to raise the count, never commit empty.
- Verify a tool works in the browser before marking it `shipped`.
- When a tool ships, add it to `shipped` in the portfolio's `content/profile.ts` and push that repo too, then mark the row `on-portfolio`.
