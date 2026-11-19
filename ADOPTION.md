# Client adoption research + plan (20 Nov 2026)

## Live catalog status verified this session

| Channel | Live status | Evidence |
|---|---|---|
| awesome-mcp-servers | **Already listed** in Aggregators with the Glyphcall description and `npx -y agent-data-tools setup <client>` | fetched raw `punkpeye/awesome-mcp-servers` README, entry `Nutshell2000/agent-data-tools` |
| MCP endpoint | **Works**: `https://api.glyphcall.com/mcp/compact` answers `initialize` over `text/event-stream` (SSE), server 1.302.1 | live JSON-RPC probe, 200 |
| 402 rails | **Works**: 4 x402 networks + MPP Tempo/EVM on all four job endpoints | `doctor.mjs` → `allOk: true` |
| CDP discovery rank | **#1** for the top fan-out job query | live CDP API, `discovery-jobs-summary.json` |
| Docker MCP Catalog | **Not listed** — prepared in `catalog/docker-remote/` (remote type, no image required) | Docker CONTRIBUTING.md: remote servers need `server.yaml`, `tools.json`, `readme.md` only |
| glyphcall-skills pack | **Not published** — built in `skills/` (3 task skills) | this folder |

## Built this session

- `install.mjs` — branded `glyphcall` MCP installer for Claude Desktop / Cursor / VS Code / Claude Code; pins our origin; never writes a wallet key.
- `doctor.mjs` — read-only live check of 402 + MPP + discovery rank.
- `test.mjs` — 5 passing tests.
- `catalog/docker-remote/{server.yaml,tools.json,readme.md}` — ready-to-PR remote server entry.
- `skills/{url-safety-triage,eu-company-check,transcribe-meeting}/SKILL.md` — agentcash-layout task skills.

## Adoption channels ranked by evidence

1. **agentcash skills** — the closest thing to a real buyer loop: AgentCash is hard-wired into
   StableEnrich, which earns $417/14d from integration buyers. A glyphcall skills pack puts our
   origin where those agents already fetch tools. Needs GitHub publish (owner).
2. **Docker MCP Catalog** — Docker Desktop MCP Toolkit + Hub `mcp` namespace; remote entry costs
   only a PR and a Docker team review. No container image needed for our streamable-http endpoint.
   Honest ceiling: installs, not guaranteed calls.
3. **MCP client catalogues** — awesome-mcp-servers already merged; remaining open routes: Docker,
   Cline marketplace (issue after install test), cursor.directory, Gemini CLI topic, mcpservers.org,
   mcp.so. Historical estimate $0–5/month each.
4. **n8n template library** — measured demand (transcription templates 58K/18K/9K views). A ready
   workflow exists at `business/integrations/n8n-template/transcribe-summary.json`. Owner decision:
   publish under `spellzcode` creator account.
5. **npm client publish** — `agent-data-tools` v1.4.1 built; publish needs npm 2FA (owner).

## Owner decisions that gate gains

1. Publish `glyphcall-skills` to GitHub and link it from the npm client README.
2. Open the Docker MCP Catalog PR with `catalog/docker-remote/` (PR in owner's GitHub account).
3. npm publish with 2FA for the updated client version.
4. Submit n8n template + Cline marketplace issue.

Nothing above was published or submitted. All assets are local and tested.

## Honest ceiling

An owned client changes *who gets the call when a developer picks a tool* — the only lever the audits
say can reach the large jobs. But install→paid-call conversion is low, and the realistic early upside
is still $0–200/month. The assets remove the "we have no installer/skill" gap; they do not guarantee
revenue.
