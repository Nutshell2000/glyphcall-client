#!/usr/bin/env node
// Glyphcall job router CLI: turn an agent's intent into one of our own paid endpoints.
//   node route.mjs "check if this link is phishing" https://example.com
// Prints the URL on stdout (easy to pipe into agentcash fetch) and the price on stderr.
import { route, urlFor } from "./router.mjs";

const [intent, value] = process.argv.slice(2);
if (!intent || intent === "--help" || intent === "-h") {
  console.log("Usage: node route.mjs \"<intent>\" <argument-value> [--origin URL]");
  process.exit(0);
}
const originAt = process.argv.indexOf("--origin");
const origin = originAt >= 0 ? process.argv[originAt + 1] : undefined;
const m = route(intent, origin);
if (!m) {
  console.error(`No Glyphcall route matched "${intent}". Try: url safety, kyb, e-invoice, transcribe, text to speech, extract, weather, crypto price, news, web search.`);
  process.exit(2);
}
if (!value) {
  console.error(`Matched ${m.id} ($${m.priceUsd}); give the value for ${m.arg}.`);
  process.exit(2);
}
console.log(urlFor(m, value));
console.error(`route ${m.id} — $${m.priceUsd} per successful call; failed calls are not charged.`);
