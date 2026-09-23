import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../../../db";
import { sessions, users } from "../../../../../db/schema";

export const dynamic = "force-dynamic";

function cookie(request: Request, name: string) {
  return request.headers.get("Cookie")?.match(new RegExp(`(?:^|; )${name}=([^;]+)`))?.[1];
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  if (!code || !state || state !== cookie(request, "oauth_state")) {
    return new Response("Invalid OAuth state", { status: 400 });
  }
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return new Response("Google OAuth is not configured", { status: 503 });
  }
  const redirectUri = new URL("/api/auth/google/callback", requestUrl.origin).toString();
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, redirect_uri: redirectUri, grant_type: "authorization_code" }) });
  if (!tokenResponse.ok) return new Response("Google token exchange failed", { status: 502 });
  const token = await tokenResponse.json() as { access_token?: string };
  if (!token.access_token) return new Response("Google token missing", { status: 502 });
  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${token.access_token}` } });
  if (!profileResponse.ok) return new Response("Google profile lookup failed", { status: 502 });
  const profile = await profileResponse.json() as { sub?: string; email?: string; name?: string; picture?: string };
  if (!profile.sub || !profile.email) return new Response("Google profile incomplete", { status: 502 });
  const db = getDb();
  const id = `google:${profile.sub}`;
  const existing = await db.select().from(users).where(eq(users.id, id)).get();
  if (existing) await db.update(users).set({ email: profile.email, name: profile.name ?? profile.email, avatarUrl: profile.picture ?? null, updatedAt: new Date().toISOString() }).where(eq(users.id, id)).run();
  else await db.insert(users).values({ id, googleSub: profile.sub, email: profile.email, name: profile.name ?? profile.email, avatarUrl: profile.picture ?? null }).run();
  const sessionId = crypto.randomUUID();
  await db.insert(sessions).values({ id: sessionId, userId: id, expiresAt: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 }).run();
  return new Response(null, { status: 302, headers: { Location: "/", "Set-Cookie": [`session=${sessionId}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`, "oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"].join(", ") } });
}
