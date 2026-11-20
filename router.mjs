// Glyphcall job router. Maps a natural-language job to ONE of our own endpoints, so a developer
// using the owned client never searches another provider for the jobs we already rank #1 for.
// Pure and dependency-free: no network, no keys, no side effects.
import { DEFAULT_ORIGIN } from "./install.mjs";

/** Highest-confidence first. Each rule: id, endpoint, price USD, and phrases that must all be plausible. */
export const RULES = [
  {
    id: "url-safety",
    path: "/pack/url-safety",
    price: 0.02,
    arg: "url",
    test: (q) => /(url|link|site|domain|checkout|open|click)/.test(q) && /(safe|phish|scam|risk|trust|malicious|verify)/.test(q),
  },
  {
    id: "kyb-eu",
    path: "/pack/kyb-eu",
    price: 0.02,
    arg: "company",
    test: (q) => /(company|counterparty|business|vendor|supplier|kyb|vat|register)/.test(q) && /(check|verify|validate|screen|sanction|eu|vies)/.test(q),
  },
  {
    id: "einvoice",
    path: "/pack/einvoice-check",
    price: 0.01,
    arg: "xml",
    test: (q) => /(invoice|xrechnung|zugferd|e-invoice)/.test(q) && /(check|valid|verify|accept)/.test(q),
  },
  {
    id: "accessibility-audit",
    path: "/audit/website",
    price: 0.01,
    arg: "url",
    test: (q) => /(accessib|wcag|axe-core|website audit)/.test(q) && !/contrast/.test(q),
  },
  {
    id: "color-contrast",
    path: "/color/contrast",
    price: 0.01,
    args: ["fg", "bg"],
    test: (q) => /(color contrast|contrast ratio|wcag contrast)/.test(q),
  },
  {
    id: "merchant-trust",
    path: "/merchant/trust",
    price: 0.02,
    arg: "name",
    test: (q) => /(merchant trust|shop trust|seller trust|trustworthy shop|is this shop)/.test(q),
  },
  {
    id: "api-recommend",
    path: "/recommend",
    price: 0.01,
    arg: "need",
    test: (q) => /(recommend|which api|compare apis|best api for)/.test(q) && /(api|tool|service)/.test(q),
  },
  {
    id: "token-verdict",
    path: "/token/verdict",
    price: 0.01,
    arg: "token",
    test: (q) => /(token safe|token verdict|rug check|due diligence|is this token)/.test(q),
  },
  {
    id: "transcribe",
    path: "/transcribe",
    price: 0.01,
    arg: "url",
    test: (q) => /(transcribe|speech to text|voice note|meeting|podcast|audio|recording)/.test(q) && !/(speech|tts|mp3 from text)/.test(q),
  },
  {
    id: "tts",
    path: "/text-to-speech",
    price: 0.08,
    arg: "text",
    test: (q) => /(text to speech|tts|read (this|it) out|speak|make an mp3|voice)/.test(q),
  },
  {
    id: "extract",
    path: "/extract",
    price: 0.002,
    arg: "url",
    test: (q) => /(page|article|pdf|web|scrape|markdown|read)/.test(q) && /(text|content|markdown|extract|pdf)/.test(q),
  },
  {
    id: "weather",
    path: "/weather/forecast",
    price: 0.002,
    arg: "city",
    test: (q) => /(weather|forecast|temperature|rain|snow)/.test(q),
  },
  {
    id: "crypto-price",
    path: "/price/crypto",
    price: 0.01,
    arg: "symbol",
    test: (q) => /(price|quote|worth|cost)/.test(q) && /(token|crypto|btc|eth|sol|coin)/.test(q),
  },
  {
    id: "news",
    path: "/news",
    price: 0.01,
    arg: "q",
    test: (q) => /(news|headlines|latest|current events)/.test(q),
  },
  {
    id: "web-search",
    path: "/web/search",
    price: 0.01,
    arg: "q",
    test: (q) => /(search|find|look up|google)/.test(q) && !/(token|crypto|company|invoice|weather)/.test(q),
  },
];

/** Route an intent to our endpoint. Returns null when no rule matches (do not guess). */
export function route(intent, origin = DEFAULT_ORIGIN) {
  if (typeof intent !== "string" || !intent.trim()) return null;
  const q = intent.toLowerCase();
  const rule = RULES.find((r) => r.test(q));
  if (!rule) return null;
  return { id: rule.id, url: `${origin.replace(/\/$/, "")}${rule.path}`, arg: rule.arg,
    ...(rule.args ? { args: rule.args } : {}), priceUsd: rule.price };
}

/** Build the actual URL when the caller supplies the argument value. */
export function urlFor(match, value) {
  if (!match) throw new Error("no route matched");
  if (match.args) {
    const values = Array.isArray(value) ? value : [value];
    if (values.length !== match.args.length) throw new Error(`${match.id} needs ${match.args.join(" and ")}`);
    const qs = match.args.map((k, i) => `${encodeURIComponent(k)}=${encodeURIComponent(String(values[i]))}`).join("&");
    return `${match.url}?${qs}`;
  }
  return `${match.url}?${encodeURIComponent(match.arg)}=${encodeURIComponent(String(value))}`;
}
