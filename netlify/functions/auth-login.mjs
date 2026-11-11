import { sign, cookie, randomToken, sha256, b64url } from "../lib/common.mjs";
export default async (req) => {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 16 || !process.env.KICK_CLIENT_SECRET)
    return new Response(null, { status: 302, headers: { location: "/tahdeer.html?login=setup#find", "cache-control": "no-store" } });
  const id = process.env.KICK_CLIENT_ID || "01M63VT1BTE2E34A0GJJBCTF62";
  const origin = new URL(req.url).origin;
  const state = randomToken(16), verifier = randomToken(48);
  const nx = new URL(req.url).searchParams.get("next") || "";
  const n = /^\/[a-z0-9\-\/]*$/i.test(nx) && !nx.startsWith("//") ? nx : undefined;
  const url = new URL("https://id.kick.com/oauth/authorize");
  url.search = new URLSearchParams({
    response_type: "code", client_id: id, redirect_uri: origin + "/api/auth/callback",
    scope: "user:read", state, code_challenge: b64url(sha256(verifier)), code_challenge_method: "S256",
  }).toString();
  return new Response(null, { status: 302, headers: {
    location: url.toString(),
    "set-cookie": cookie("tu1b_oauth", sign({ s: state, v: verifier, n, exp: Date.now() + 10 * 60e3 }), 600, "/api/auth"),
    "cache-control": "no-store",
  }});
};
export const config = { path: "/api/auth/login" };
