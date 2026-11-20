#!/usr/bin/env node
// Live price-drift checker for the owned client's router. No keys, no payments.
//   node prices.mjs [--origin https://api.glyphcall.com]
// Exits 1 when a router price differs from the live 402 quote.
import { RULES } from "./router.mjs";
import { DEFAULT_ORIGIN } from "./install.mjs";

const at = process.argv.indexOf("--origin");
const origin = (at >= 0 ? process.argv[at + 1] : process.env.GLYPHCALL_ORIGIN || DEFAULT_ORIGIN).replace(/\/$/, "");

async function livePrice(rule) {
  try {
    const r = await fetch(origin + rule.path, { headers: { "accept-encoding": "identity" }, redirect: "manual" });
    const h = r.headers.get("payment-required") || "";
    if (!h) return { error: `HTTP ${r.status}, no PAYMENT-REQUIRED` };
    const d = JSON.parse(Buffer.from(h, "base64").toString("utf8"));
    const a = d.accepts?.[0];
    if (!a) return { error: "no accepts entry" };
    return { usd: Number(a.amount) / 1e6 };
  } catch (e) { return { error: String(e?.message ?? e) }; }
}

const rows = [];
for (const rule of RULES) {
  const live = await livePrice(rule);
  rows.push({ id: rule.id, path: rule.path, routerUsd: rule.price, ...live,
    ok: live.usd !== undefined && Math.abs(live.usd - rule.price) < 1e-9 });
}
const bad = rows.filter((r) => !r.ok);
console.log(JSON.stringify({ origin, checkedAt: new Date().toISOString(), rows,
  allMatch: bad.length === 0, mismatches: bad.map((r) => r.id) }, null, 2));
if (bad.length) process.exitCode = 1;
