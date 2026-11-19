// First-party install beacon. Default ON to our own /e endpoint, with a documented opt-out.
// Only a random install id and the client target are sent — no key, wallet, path or identity.
import { randomUUID } from "node:crypto";

export const DEFAULT_TELEMETRY_URL = "https://api.glyphcall.com/e";

export function shouldSend(env = process.env) {
  if (env.GLYPHCALL_TELEMETRY_OFF) return false;
  return true;
}

export function endpoint(env = process.env) {
  return env.GLYPHCALL_TELEMETRY_URL || DEFAULT_TELEMETRY_URL;
}

export async function sendInstall(target, env = process.env, fetcher = globalThis.fetch) {
  if (!shouldSend(env)) return { sent: false, reason: "opted out" };
  const url = new URL(endpoint(env));
  url.searchParams.set("ev", "client_install");
  url.searchParams.set("p", target);
  url.searchParams.set("i", randomUUID());
  try {
    await fetcher(url.toString(), { method: "GET", redirect: "manual" });
    return { sent: true, url: url.toString() };
  } catch (e) {
    return { sent: false, reason: String(e?.message ?? e) };
  }
}
