#!/usr/bin/env node
// Multi-chain readiness check for the owned client. Read-only, no keys, no payments.
// Reports every payment rail our endpoints advertise: x402 networks in PAYMENT-REQUIRED
// and MPP methods in WWW-Authenticate.
//   node chains.mjs [--origin https://api.glyphcall.com]
import { DEFAULT_ORIGIN } from "./install.mjs";

const at = process.argv.indexOf("--origin");
const origin = (at >= 0 ? process.argv[at + 1] : process.env.GLYPHCALL_ORIGIN || DEFAULT_ORIGIN).replace(/\/$/, "");
const paths = ["/pack/url-safety", "/ai/speech", "/weather/forecast", "/price/token", "/extract"];

async function rails(p) {
  try {
    const r = await fetch(origin + p, { headers: { "accept-encoding": "identity" }, redirect: "manual" });
    const h = r.headers.get("payment-required") || "";
    const wa = r.headers.get("www-authenticate") || "";
    let x402 = null;
    try { x402 = JSON.parse(Buffer.from(h, "base64").toString("utf8")); } catch {}
    return {
      path: p, status: r.status,
      x402Networks: [...new Set((x402?.accepts || []).map((a) => a.network))],
      mppMethods: [...new Set([...wa.matchAll(/method="([^"]+)"/g)].map((m) => m[1]))],
      caip2: [...new Set((x402?.accepts || []).map((a) => a.asset))].length,
    };
  } catch (e) { return { path: p, error: String(e?.message ?? e) }; }
}

const rows = await Promise.all(paths.map(rails));
const allNetworks = [...new Set(rows.flatMap((r) => r.x402Networks || []))];
const allMpp = [...new Set(rows.flatMap((r) => r.mppMethods || []))];
console.log(JSON.stringify({ origin, checkedAt: new Date().toISOString(), rows,
  allNetworks, allMpp, chainCount: allNetworks.length + allMpp.length }, null, 2));
if (!allNetworks.length) process.exitCode = 1;
