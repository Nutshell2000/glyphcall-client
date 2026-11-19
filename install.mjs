#!/usr/bin/env node
// Glyphcall owned client installer.
// Adds a branded "glyphcall" MCP entry to Claude Desktop, Cursor, VS Code or Claude Code that
// pins OUR origin and reuses the already-built agent-data-tools stdio client (wallet mode included).
// Nothing is published, no account is created, and no secret is written by this script.
//
//   node install.mjs <claude-desktop|cursor|vscode|claude-code> [--print] [--key adt_...]
//                    [--origin https://api.glyphcall.com] [--full]
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

export const NAME = "glyphcall";
export const DEFAULT_ORIGIN = "https://api.glyphcall.com";
const PACKAGE = "agent-data-tools";
const TARGETS = ["claude-desktop", "cursor", "vscode", "claude-code"];

/** Pure config builder — exported so it can be tested without touching disk. */
export function entryFor(target, { origin = DEFAULT_ORIGIN, key, full = false } = {}) {
  if (!TARGETS.includes(target)) throw new Error(`unknown target "${target}"; use ${TARGETS.join(", ")}`);
  const base = origin.replace(/\/$/, "");
  const args = ["-y", PACKAGE, "mcp", ...(full ? ["--full"] : [])];
  const env = { AGENT_DATA_TOOLS_ORIGIN: base };
  if (key) {
    if (!/^adt_\S+$/.test(key)) throw new Error("the key must start with adt_");
    env.AGENT_DATA_TOOLS_KEY = key;
  }
  if (target === "claude-code") {
    const header = key ? ` --header "Authorization: Bearer ${key}"` : "";
    return { command: `claude mcp add --transport http ${NAME} ${base}${full ? "/mcp/all" : "/mcp/compact"}${header}` };
  }
  if (target === "cursor") return { section: "mcpServers", entry: { url: `${base}${full ? "/mcp/all" : "/mcp/compact"}`, ...(key ? { headers: { Authorization: `Bearer ${key}` } } : {}) } };
  if (target === "vscode") return { section: "servers", entry: key ? { type: "stdio", command: "npx", args, env } : { type: "http", url: `${base}${full ? "/mcp/all" : "/mcp/compact"}` } };
  // claude-desktop: local command reads the key/origin from its env
  return { section: "mcpServers", entry: { command: "npx", args, env } };
}

export function configPath(target) {
  if (target === "cursor") return join(homedir(), ".cursor", "mcp.json");
  if (target === "vscode") return resolve(".vscode", "mcp.json");
  if (target === "claude-desktop") {
    if (process.platform === "win32") return join(process.env.APPDATA || join(homedir(), "AppData", "Roaming"), "Claude", "claude_desktop_config.json");
    if (process.platform === "darwin") return join(homedir(), "Library", "Application Support", "Claude", "claude_desktop_config.json");
    return join(homedir(), ".config", "Claude", "claude_desktop_config.json");
  }
  return null;
}

/** Merge one server entry into a JSON config, keeping everything else and leaving a .bak. */
export function mergeInto(file, section, entry, print = false) {
  const snippet = JSON.stringify({ [section]: { [NAME]: entry } }, null, 2);
  if (print) { console.log(`${file}\n${snippet}`); return false; }
  let json = {};
  const exists = existsSync(file);
  if (exists) {
    try { json = JSON.parse(readFileSync(file, "utf8").replace(/^\uFEFF/, "")); } catch { json = null; }
    const usable = json && typeof json === "object" && !Array.isArray(json) && (json[section] === undefined || (json[section] && typeof json[section] === "object" && !Array.isArray(json[section])));
    if (!usable) {
      console.error(`${file} is not JSON this command can edit; add this yourself:\n${snippet}`);
      process.exitCode = 1;
      return false;
    }
    copyFileSync(file, `${file}.bak`);
  } else mkdirSync(dirname(file), { recursive: true });
  json[section] = { ...(json[section] ?? {}), [NAME]: entry };
  writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`);
  console.log(`${exists ? "Updated" : "Created"} ${file}${exists ? " (previous version: .bak)" : ""}`);
  return true;
}

function main() {
  const [target, ...flags] = process.argv.slice(2);
  const flag = (name) => { const i = flags.indexOf(name); return i < 0 ? undefined : flags[i + 1]; };
  const opts = {
    print: flags.includes("--print"),
    full: flags.includes("--full"),
    key: flag("--key"),
    origin: flag("--origin") || process.env.GLYPHCALL_ORIGIN || DEFAULT_ORIGIN,
  };
  if (!target || target === "--help" || target === "-h" || target === "help") {
    console.log(`Usage: node install.mjs <claude-desktop|cursor|vscode|claude-code> [--print] [--key adt_...] [--origin URL] [--full]\n\nDefault origin: ${DEFAULT_ORIGIN}\nWallet mode: set AGENT_DATA_TOOLS_WALLET_KEY in your shell before starting the client (no key is written here).`);
    return;
  }
  const built = entryFor(target, opts);
  if (target === "claude-code") {
    console.log(built.command);
    console.error("Run that command in a terminal. Wallet mode: export AGENT_DATA_TOOLS_WALLET_KEY first.");
    return;
  }
  mergeInto(configPath(target), built.section, built.entry, opts.print);
  console.error(`Server name: ${NAME}. Restart the client to load it. Wallet mode: set AGENT_DATA_TOOLS_WALLET_KEY in the launching shell.`);
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop())) main();
