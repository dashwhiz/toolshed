# Toolshed

Small tools for questions that keep coming up — is this website real, where does a link in
an email actually go, what is hidden in this text — plus the everyday ones you would
otherwise hunt for a site to do, like formatting JSON or decoding a token.

Each one is a single static page — no build step, no backend, no API keys, no accounts.

The tools that only inspect text — `json`, `unicode`, `injection-scan`, `link` — never send
what you paste anywhere. The domain tools — `site-check`, `dns`, `email-auth` — look the
domain up against public DNS, RDAP and IP-info services, because that is the question they
answer; nothing else is transmitted.

**Live: https://dashwhiz.github.io/toolshed/**

See [`ROADMAP.md`](ROADMAP.md) for what is built and what is next, and
[`DESIGN.md`](DESIGN.md) for the rules every page follows.

## Running it locally

```bash
python3 -m http.server 8899
```

Then open <http://localhost:8899/>. Opening the files over `file://` will not work — the
pages use ES modules, which need a real origin.

Built by [Aleksandar Velichkovikj](https://alekvel.dev).
