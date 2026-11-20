# Multi-chain tool-call selling research (20 Nov 2026)

## Our rails (verified live by `chains.mjs`)

Every checked endpoint advertises six rails:

- x402 USDC on **Base** (`eip155:8453`), **Polygon** (`eip155:137`), **Arbitrum** (`eip155:42161`), **Solana** (`solana:5eykt4…`)
- MPP on **Tempo** and **EVM** via `WWW-Authenticate: Payment`

So the client is already multi-chain; no code change is needed to accept non-Base buyers.

## Where the money actually is (x402scan public API, read-only)

**Solana, 7 days, 8,000 transfers sampled:**

| Payee | Calls | USD | Senders | Note |
|---|---|---|---|---|
| `3MZVk97…` | 10 | **$6,352** | 1 | Two huge one-offs ($5,598, $7,952) plus small ones; not a tool-call job |
| `7xvuVbuy…` | 5 | $101 | 3 | matches the $101/call pattern seen on Base |
| `Bd2xS189…` | 504 | $10.08 | 12 | real repeat, tiny |
| `AQqnMFBw…` | 6,519 | $7.12 | 9 | payAI, high volume low price |
| `9MkM5Ra4…` | 658 | $3.29 | 8 | real repeat, tiny |

**Our own non-Base revenue:** Solana 12 payments / **$0.024 in 30 days**; earlier audit found
Arbitrum 39 payments / $0.395 and Tempo/MPP 0. Total outside Base ≈ $0.40/month.

**Other chains:** x402scan returned no data for Polygon/Optimism and 400 for Arbitrum/Ethereum/
Tempo/Avalanche with the same query shape — coverage is Base + Solana only.

## Conclusion

Multi-chain tool-call selling is not a big-money channel today: the largest Solana payees are
one-off large transfers, not recurring tool jobs, and our own non-Base income is ~$0.40/month.
The client already accepts all six rails, so the right move is to keep the existing Base-focused
distribution work going rather than build for non-Base demand that isn't there.

The one multi-chain distribution channel with an open submission is **Pay.sh** (Solana Foundation
+ Google Cloud gateway used by Gemini CLI, Claude Code and Codex): PR
`solana-foundation/pay-skills#369` is OPEN/MERGEABLE and awaits review.
