# Glyphcall owned client

The research conclusion: every seller above ~$10/day ships **the thing the agent runs** — an
installer, wallet, skill or console. Listing edits and price changes cannot win the large jobs.
This folder is that owned distribution layer. It reuses the already-built `agent-data-tools`
client (wallet pay + MCP stdio) but pins **our** origin and brands the server as `glyphcall`.

## Install into a client (one command)

```sh
node install.mjs claude-desktop      # writes Claude Desktop config
node install.mjs cursor              # writes ~/.cursor/mcp.json
node install.mjs vscode              # writes .vscode/mcp.json in this folder
node install.mjs claude-code         # prints the `claude mcp add` command
```

Options: `--print` (show, don't write), `--key adt_...` (card credit), `--origin URL`, `--full`.

**Wallet mode** (no account, no key): set `AGENT_DATA_TOOLS_WALLET_KEY` to a 32-byte hex private
key of a wallet holding USDC on Base **in the shell that launches the client**. The installer never
writes or logs it. Spend is capped at $0.10/call and $1/day by default. Failed calls are not charged.

## Job router — capture the call instead of searching for a provider

```sh
node route.mjs "is this link safe to open" https://example.com
# -> https://api.glyphcall.com/pack/url-safety?url=https%3A%2F%2Fexample.com
```

The router maps ten high-frequency job phrases to our own endpoints with verified live prices.
It returns `null` rather than guessing when nothing matches. Use its URL with `agentcash fetch`,
or paste it into any x402/MPP client. This is the "own the thing the agent runs" lever: the
developer never goes looking for another provider for the jobs we already rank #1 for.

## Price drift

```sh
node prices.mjs
```

Checks the router's ten prices against the live 402 quotes and exits 1 on drift. Run it before
each release: prices can change when a new server version ships (two changed during this session,
`/pack/url-safety` 0.01→0.02 and `/price/crypto` 0.002→0.01). The same check runs in `test.mjs`.

## Doctor

```sh
node doctor.mjs
```

Read-only: verifies the four job-critical endpoints answer 402 with x402 networks **and** an MPP
Tempo challenge, then checks our live CDP discovery rank for "url safety phishing check".

## Tests

```sh
node --test test.mjs
```

## Published assets

- [glyphcall-client](https://github.com/Nutshell2000/glyphcall-client) — this folder, including
  `gemini-extension.json` and the GitHub topic `gemini-cli-extension` (Gemini CLI crawls daily).
- [glyphcall-skills](https://github.com/Nutshell2000/glyphcall-skills) — the three task skills as a
  standalone installable repo.
- Docker MCP Catalog — remote entry prepared in `catalog/docker-remote/`; the existing PR
  [docker/mcp-registry#6899](https://github.com/docker/mcp-registry/pull/6899) was unblocked with a
  note that the source repo is now MIT-licensed.

## Measuring installs

The installer sends one anonymous `client_install` event to our own first-party endpoint
`https://api.glyphcall.com/e` (live, returns 204) with a random install id and the client target —
no key, wallet, path or identity. Set `GLYPHCALL_TELEMETRY_OFF=1` to disable, or
`GLYPHCALL_TELEMETRY_URL` to point at another collector. Compare install events with `/status`
call counts to judge each channel; the per-event dashboard is owner-gated.

## What this does not do

- No publish to npm (owner decision: 2FA), no account creation, no funds moved.
- No rewriting of the existing `agent-data-tools` package. This is a thin, branded installer on top.
- No claim of guaranteed revenue. Realistic upside from an owned client is $0–200/month at first,
  with the larger jobs requiring the client to be the one a developer actually runs.
