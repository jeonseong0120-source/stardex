import { eq, and, gt } from "drizzle-orm";
import { getDb } from "../../../db";
import { users, sessions } from "../../../db/schema";

export const dynamic = "force-dynamic";

/** Returns the current workspace-authenticated user, persisted in D1. */
export async function GET(request: Request) {
  const sessionId = request.headers.get("Cookie")?.match(/(?:^|; )session=([^;]+)/)?.[1];
  if (sessionId) {
    const db = getDb();
    const session = await db.select({ user: users }).from(sessions).innerJoin(users, eq(sessions.userId, users.id)).where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, Math.floor(Date.now() / 1000)))).get();
    if (session) return Response.json({ user: session.user });
  }
  const userId = request.headers.get("oai-authenticated-user-id");
  const email = request.headers.get("oai-authenticated-user-email");
  if (!userId || !email) {
    return Response.json({ user: null }, { status: 401 });
  }

  const db = getDb();
  const existing = await db.select().from(users).where(eq(users.id, userId)).get();
  if (!existing) {
    const created = {
      id: userId,
      googleSub: `workspace:${userId}`,
      email,
      name: request.headers.get("oai-authenticated-user-full-name") ?? email,
    };
    await db.insert(users).values(created).onConflictDoNothing().run();
    return Response.json({ user: { ...created, role: "USER" } }, { status: 201 });
  }

  return Response.json({ user: existing });
}
