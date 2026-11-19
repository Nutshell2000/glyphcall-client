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

## What this does not do

- No publish to npm (owner decision: 2FA), no account creation, no funds moved.
- No rewriting of the existing `agent-data-tools` package. This is a thin, branded installer on top.
- No claim of guaranteed revenue. Realistic upside from an owned client is $0–200/month at first,
  with the larger jobs requiring the client to be the one a developer actually runs.
