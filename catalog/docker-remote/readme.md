# Glyphcall MCP server

Glyphcall is a pay-per-call API for agents. The compact MCP surface exposes three meta-tools
(`find_tool`, `tool_details`, `call_tool`) that reach 650+ tools, so a client carries three tool
definitions instead of several hundred.

- Documentation: https://glyphcall.com
- OpenAPI: https://api.glyphcall.com/openapi.json
- Pricing: https://glyphcall.com/pricing
- Source: https://github.com/Nutshell2000/agent-data-tools

The endpoint answers over streamable HTTP. The first 25 MCP calls are free; after that a call is
paid in USDC over x402 (Base, Polygon, Arbitrum, Solana) or MPP (Tempo, Base), or with a prepaid
card key. Failed calls are not charged.

## Client setup

```sh
npx -y agent-data-tools setup <claude-code|claude-desktop|cursor|vscode>
```

Or connect the remote URL directly: `https://api.glyphcall.com/mcp/compact`.
