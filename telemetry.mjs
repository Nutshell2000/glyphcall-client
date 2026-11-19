// Opt-in, privacy-safe install beacon. Nothing is sent unless GLYPHCALL_TELEMETRY_URL is set.
// Only a random install id and the client target are sent — no key, wallet, path or identity.
import { randomUUID } from "node:crypto";

export function shouldSend(env = process.env) {
  return typeof env.GLYPHCALL_TELEMETRY_URL === "string" && env.GLYPHCALL_TELEMETRY_URL.length > 0;
}

export async function sendInstall(target, env = process.env, fetcher = globalThis.fetch) {
  if (!shouldSend(env)) return { sent: false, reason: "not configured" };
  const url = new URL(env.GLYPHCALL_TELEMETRY_URL);
  url.searchParams.set("ev", "client_install");
  url.searchParams.set("p", target);
  url.searchParams.set("i", randomUUID());
  try {
    await fetcher(url.toString(), { method: "GET", redirect: "manual" });
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: String(e?.message ?? e) };
  }
}
