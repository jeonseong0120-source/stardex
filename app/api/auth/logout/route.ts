import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { sessions } from "../../../../db/schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const sessionId = request.headers.get("Cookie")?.match(/(?:^|; )session=([^;]+)/)?.[1];
  if (sessionId) await getDb().delete(sessions).where(eq(sessions.id, sessionId)).run();

  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return Response.json({ ok: true }, {
    headers: { "Set-Cookie": `session=; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=0` },
  });
}
