import test from "node:test";
import assert from "node:assert/strict";
import { entryFor, NAME, DEFAULT_ORIGIN, mergeInto } from "./install.mjs";
import { route, urlFor, RULES } from "./router.mjs";
import { sendInstall, shouldSend, DEFAULT_TELEMETRY_URL } from "./telemetry.mjs";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("branded server name and pinned origin", () => {
  assert.equal(NAME, "glyphcall");
  assert.equal(DEFAULT_ORIGIN, "https://api.glyphcall.com");
  const d = entryFor("claude-desktop");
  assert.equal(d.entry.command, "npx");
  assert.deepEqual(d.entry.args, ["-y", "agent-data-tools", "mcp"]);
  assert.equal(d.entry.env.AGENT_DATA_TOOLS_ORIGIN, DEFAULT_ORIGIN);
  assert.equal(d.entry.env.AGENT_DATA_TOOLS_WALLET_KEY, undefined);
});

test("full mode and key handling", () => {
  const f = entryFor("vscode", { full: true, key: "adt_abc123" });
  assert.ok(f.entry.args.includes("--full"));
  assert.equal(f.entry.env.AGENT_DATA_TOOLS_KEY, "adt_abc123");
  assert.equal(f.entry.type, "stdio"); // a key must not be written into a project file
  assert.throws(() => entryFor("cursor", { key: "bad" }), /adt_/);
});

test("cursor uses our http url, claude-code prints a command", () => {
  const c = entryFor("cursor");
  assert.equal(c.entry.url, `${DEFAULT_ORIGIN}/mcp/compact`);
  const cc = entryFor("claude-code");
  assert.match(cc.command, /claude mcp add --transport http glyphcall https:\/\/api\.glyphcall\.com\/mcp\/compact/);
});

test("merge keeps existing servers and leaves a backup", () => {
  const dir = mkdtempSync(join(tmpdir(), "glyph-"));
  const file = join(dir, "mcp.json");
  writeFileSync(file, JSON.stringify({ mcpServers: { existing: { url: "https://example.com" } } }));
  const before = readFileSync(file, "utf8");
  assert.equal(mergeInto(file, "mcpServers", entryFor("claude-desktop").entry), true);
  const after = JSON.parse(readFileSync(file, "utf8"));
  assert.ok(after.mcpServers.existing);
  assert.ok(after.mcpServers.glyphcall);
  assert.equal(readFileSync(`${file}.bak`, "utf8"), before);
});

test("unknown target rejected", () => {
  assert.throws(() => entryFor("nope"), /unknown target/);
});

test("router picks our endpoints for the big jobs", () => {
  const cases = [
    ["is this link safe to open", "https://example.com", "url-safety", "/pack/url-safety"],
    ["verify this EU company VAT before paying", "DE123456789", "kyb-eu", "/pack/kyb-eu"],
    ["transcribe this meeting recording", "https://ex.com/a.mp3", "transcribe", "/transcribe"],
    ["what is the weather forecast in Stockholm", "Stockholm", "weather", "/weather/forecast"],
    ["BTC token price", "BTC", "crypto-price", "/price/crypto"],
    ["extract this page as markdown", "https://ex.com", "extract", "/extract"],
  ];
  for (const [intent, value, id, path] of cases) {
    const m = route(intent);
    assert.ok(m, `should match: ${intent}`);
    assert.equal(m.id, id);
    assert.match(urlFor(m, value), new RegExp(path.replace("/", "\\/")));
  }
  assert.equal(route("something totally unrelated"), null);
});

test("router prices match the live 402 quotes", async () => {
  for (const rule of RULES) {
    const r = await fetch("https://api.glyphcall.com" + rule.path, { redirect: "manual" });
    const h = r.headers.get("payment-required") || "";
    const d = JSON.parse(Buffer.from(h, "base64").toString("utf8"));
    assert.equal(Number(d.accepts[0].amount) / 1e6, rule.price, `${rule.id} price drift`);
  }
});

test("telemetry sends to our first-party endpoint and no secrets, with opt-out", async () => {
  assert.equal(shouldSend({}), true);
  assert.equal(shouldSend({ GLYPHCALL_TELEMETRY_OFF: "1" }), false);
  assert.equal((await sendInstall("cursor", { GLYPHCALL_TELEMETRY_OFF: "1" }, async () => { throw new Error("should not be called"); })).sent, false);
  let seen;
  const r = await sendInstall("cursor", {}, async (u) => { seen = u; return { ok: true }; });
  assert.equal(r.sent, true);
  assert.ok(seen.startsWith(DEFAULT_TELEMETRY_URL));
  assert.match(seen, /ev=client_install/);
  assert.match(seen, /p=cursor/);
  assert.doesNotMatch(seen, /adt_|0x[0-9a-f]{64}/i);
});
