# Toolshed

Small tools for questions that keep coming up — is this website real, where does a link in
an email actually go, what is hidden in this text. Built one at a time, as I or people around
me needed them.

Each one is a single static page — no build step, no backend, no API keys, no accounts.
Everything runs in your browser.

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
