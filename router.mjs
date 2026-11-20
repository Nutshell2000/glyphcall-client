// Glyphcall job router. Maps a natural-language job to ONE of our own endpoints, so a developer
// using the owned client never searches another provider for the jobs we already rank #1 for.
// Pure and dependency-free: no network, no keys, no side effects.
import { DEFAULT_ORIGIN } from "./install.mjs";

/** Highest-confidence first. Each rule: id, endpoint, price USD, and phrases that must all be plausible. */
export const RULES = [
  {
    id: "url-safety",
    path: "/pack/url-safety",
    price: 0.01,
    arg: "url",
    test: (q) => /(url|link|site|domain|checkout|open|click)/.test(q) && /(safe|phish|scam|risk|trust|malicious|verify)/.test(q),
  },
  { id: "sanctions", path: "/sanctions/check", price: 0.009, arg: "address",
    test: (q) => /(sanction|ofac|sdn list)/.test(q) },
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
  // The 28 questions the paid x402 Service Finder asks (stored answers 11 Nov). We won 2/28;
  // these routes let an owned client take the other jobs directly instead of shopping.
  { id: "indicators", path: "/hyperliquid/indicators", price: 0.01, arg: "coin",
    test: (q) => /(technical indicator|rsi|macd)/.test(q) },
  // Jobs the two new repeat buyers (0x54e163, 0x5be4d4) pay other sellers for today.
  { id: "stock-quote", path: "/stock/quote", price: 0.002, arg: "symbol",
    test: (q) => /(stock quote|stock price|stock snapshot|unified stock)/.test(q) },
  { id: "wallet-portfolio", path: "/wallet/portfolio", price: 0.005, arg: "address",
    test: (q) => /(wallet portfolio|portfolio value|token holdings|wallet holdings)/.test(q) },
  { id: "btc-fees", path: "/btc-fees", price: 0.002, arg: null,
    test: (q) => /(bitcoin fee|btc fee|fee estimate)/.test(q) },
  { id: "gas-price", path: "/gas/price", price: 0.002, arg: null,
    test: (q) => /(gas price|base gas)/.test(q) },
  { id: "fx-rate", path: "/fx", price: 0.002, args: ["from", "to"],
    test: (q) => /(exchange rate|currency rate|fx rate|convert currency)/.test(q) },
  { id: "url-uptime", path: "/url/uptime", price: 0.01, arg: "url",
    test: (q) => /(website is up|site is up|url uptime|is.*website.*up)/.test(q) },
  { id: "commodity", path: "/commodity/price", price: 0.001, arg: "commodity",
    test: (q) => /(commodity price|gold price|oil price)/.test(q) },
  { id: "robots", path: "/robots", price: 0.001, arg: "url",
    test: (q) => /(robots\.txt|crawler access)/.test(q) },
  { id: "email-verify", path: "/email/verify", price: 0.01, arg: "address",
    test: (q) => /(verify an email|email verification|is this email valid)/.test(q) },
  { id: "sec-filings", path: "/sec/filings", price: 0.002, arg: "ticker",
    test: (q) => /(sec filings|company filings)/.test(q) },
  { id: "timezone-convert", path: "/timezone/convert", price: 0.002, args: ["at", "zone"],
    test: (q) => /(convert time between|time zone convert|timezone convert)/.test(q) },
  { id: "x402-check", path: "/x402/check", price: 0.01, arg: "url",
    test: (q) => /(check an x402|x402 endpoint)/.test(q) },
  { id: "isbn", path: "/validate/isbn", price: 0.01, arg: "isbn",
    test: (q) => /(isbn|book by)/.test(q) },
  { id: "perp-funding", path: "/perp/funding", price: 0.002, arg: "coin",
    test: (q) => /(perpetual funding|funding rates)/.test(q) },
  { id: "package-risk", path: "/package", price: 0.002, args: ["ecosystem", "name"],
    test: (q) => /(npm package.*risk|check an npm package|package for risk)/.test(q) },
  { id: "github-user", path: "/github/search", price: 0.002, arg: "q",
    test: (q) => /(github user|github repositories)/.test(q) },
  { id: "contract-risk", path: "/contract-risk", price: 0.01, arg: "address",
    test: (q) => /(smart contract audit|contract risk)/.test(q) },
  { id: "whois", path: "/domain/whois", price: 0.01, arg: "name",
    test: (q) => /(whois|domain lookup)/.test(q) },
  { id: "wikipedia", path: "/wikipedia", price: 0.002, arg: "title",
    test: (q) => /(wikipedia|article summary)/.test(q) },
  { id: "sentiment", path: "/ai/sentiment", price: 0.01, arg: "text",
    test: (q) => /(sentiment analysis|sentiment of text)/.test(q) },
  { id: "ai-chat", path: "/ai/chat", price: 0.002, arg: "prompt",
    test: (q) => /(chat completion|llm chat)/.test(q) },
  { id: "token-price", path: "/price/token", price: 0.002, arg: "symbol",
    test: (q) => /(crypto token price|token price)/.test(q) },
  {
    id: "transcribe",
    path: "/transcribe",
    price: 0.01,
    arg: "url",
    test: (q) => /(transcribe|speech to text|voice note|meeting|podcast|audio|recording)/.test(q) && !/(speech|tts|mp3 from text)/.test(q),
  },
  {
    id: "tts",
    // 8x cheaper than /text-to-speech ($0.08); same voice task at $0.01.
    path: "/ai/speech",
    price: 0.01,
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
    price: 0.002,
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
  return { id: rule.id, url: `${origin.replace(/\/$/, "")}${rule.path}`,
    arg: rule.arg === null ? null : rule.arg,
    ...(rule.args ? { args: rule.args } : {}), priceUsd: rule.price };
}

/** Build the actual URL when the caller supplies the argument value. */
export function urlFor(match, value) {
  if (!match) throw new Error("no route matched");
  if (match.arg === null) return match.url;
  if (match.args) {
    const values = Array.isArray(value) ? value : [value];
    if (values.length !== match.args.length) throw new Error(`${match.id} needs ${match.args.join(" and ")}`);
    const qs = match.args.map((k, i) => `${encodeURIComponent(k)}=${encodeURIComponent(String(values[i]))}`).join("&");
    return `${match.url}?${qs}`;
  }
  return `${match.url}?${encodeURIComponent(match.arg)}=${encodeURIComponent(String(value))}`;
}


