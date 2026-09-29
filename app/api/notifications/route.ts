import { and, desc, eq, gt } from "drizzle-orm";
import { getDb } from "../../../db";
import { cards, notifications, sessions, users } from "../../../db/schema";

export const dynamic = "force-dynamic";

async function currentUser(request: Request) {
  const id = request.headers.get("Cookie")?.match(/(?:^|; )session=([^;]+)/)?.[1];
  if (!id) return null;
  return (await getDb().select({ user: users }).from(sessions).innerJoin(users, eq(sessions.userId, users.id)).where(and(eq(sessions.id, id), gt(sessions.expiresAt, Math.floor(Date.now() / 1000)))).get())?.user ?? null;
}

export async function GET(request: Request) {
  const user = await currentUser(request); if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const rows = await getDb().select({ notification: notifications, artworkUrl: cards.artworkUrl, rarity: cards.rarity, cardName: cards.name }).from(notifications).leftJoin(cards, eq(notifications.cardId, cards.id)).where(eq(notifications.userId, user.id)).orderBy(desc(notifications.createdAt)).limit(50).all();
  return Response.json({ notifications: rows.map(({ notification, artworkUrl, rarity, cardName }) => ({ ...notification, artworkUrl, rarity, cardName, data: (() => { try { return JSON.parse(notification.dataJson); } catch { return {}; } })() })) });
}

export async function POST(request: Request) {
  const user = await currentUser(request); if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const body = await request.json() as { action?: "read" | "read-all"; notificationId?: string };
  if (body.action === "read-all") { await getDb().update(notifications).set({ readAt: new Date().toISOString() }).where(and(eq(notifications.userId, user.id), eq(notifications.readAt, null))).run(); return Response.json({ ok: true }); }
  if (body.action === "read" && body.notificationId) { await getDb().update(notifications).set({ readAt: new Date().toISOString() }).where(and(eq(notifications.id, body.notificationId), eq(notifications.userId, user.id))).run(); return Response.json({ ok: true }); }
  return Response.json({ error: "올바른 알림 요청이 필요합니다." }, { status: 400 });
}
