#!/usr/bin/env node
// Glyphcall owned-client doctor: read-only checks that the rails an owned client depends on are live.
// No keys, no payments, no writes.
//
//   node doctor.mjs [--origin https://api.glyphcall.com]
import { DEFAULT_ORIGIN } from "./install.mjs";

const originFlagAt = process.argv.indexOf("--origin");
const originArg = originFlagAt >= 0 ? process.argv[originFlagAt + 1] : undefined;
const origin = (originArg || process.env.GLYPHCALL_ORIGIN || DEFAULT_ORIGIN).replace(/\/$/, "");
const checks = [
  { name: "url safety (top fan-out job)", path: "/pack/url-safety?url=https%3A%2F%2Fexample.com" },
  { name: "weather forecast (payer breadth)", path: "/weather/forecast" },
  { name: "crypto price", path: "/price/crypto?symbol=BTC" },
  { name: "text to speech", path: "/text-to-speech?text=hello" },
];

async function check(c) {
  try {
    const r = await fetch(origin + c.path, { headers: { "accept-encoding": "identity" }, signal: AbortSignal.timeout(12000), redirect: "manual" });
    const pr = r.headers.get("payment-required") || "";
    const wa = r.headers.get("www-authenticate") || "";
    const x402 = (() => { try { return JSON.parse(Buffer.from(pr, "base64").toString("utf8")); } catch { return null; } })();
    const networks = (x402?.accepts || []).map((a) => a.network);
    return {
      check: c.name,
      status: r.status,
      x402Networks: networks.length,
      mppTempo: /method="tempo"/.test(wa),
      mppEvm: /method="evm"/.test(wa),
      ok: r.status === 402 && networks.length > 0 && /method="tempo"/.test(wa),
    };
  } catch (e) { return { check: c.name, ok: false, error: String(e?.message || e) }; }
}

async function discovery() {
  try {
    const q = encodeURIComponent("url safety phishing check");
    const r = await fetch(`https://api.cdp.coinbase.com/platform/v2/x402/discovery/search?query=${q}&limit=20`, { signal: AbortSignal.timeout(12000) });
    const j = await r.json();
    const rows = j.resources || [];
    const ours = rows.filter((x) => /glyphcall\.com|revmesh2074/.test(x.resource));
    return { ok: ours.length > 0, found: ours.length, bestRank: rows.findIndex((x) => /glyphcall\.com|revmesh2074/.test(x.resource)) + 1,
      payers: ours.map((x) => ({ resource: x.resource, payers: x.quality?.l30DaysUniquePayers, calls: x.quality?.l30DaysTotalCalls })).slice(0, 3) };
  } catch (e) { return { ok: false, error: String(e?.message || e) }; }
}

const results = await Promise.all(checks.map(check));
const disc = await discovery();
console.log(JSON.stringify({ origin, generatedAt: new Date().toISOString(), endpoints: results, discovery: disc,
  allOk: results.every((r) => r.ok) && disc.ok }, null, 2));
if (!results.every((r) => r.ok) || !disc.ok) process.exitCode = 1;
