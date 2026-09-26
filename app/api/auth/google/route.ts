import { env } from "cloudflare:workers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const clientId = env.GOOGLE_CLIENT_ID;
  if (!clientId) return new Response("Google OAuth is not configured", { status: 503 });
  const url = new URL(request.url);
  const callback = new URL("/api/auth/google/callback", url.origin);
  const secure = url.protocol === "https:" ? "; Secure" : "";
  const state = crypto.randomUUID();
  const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  auth.searchParams.set("client_id", clientId);
  auth.searchParams.set("redirect_uri", callback.toString());
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("scope", "openid email profile");
  auth.searchParams.set("state", state);
  return new Response(null, { status: 302, headers: {
    Location: auth.toString(),
    "Set-Cookie": `oauth_state=${state}; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=600`,
  }});
}
