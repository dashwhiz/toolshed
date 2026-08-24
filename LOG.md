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

Next: `unicode`, then `injection-scan`.
