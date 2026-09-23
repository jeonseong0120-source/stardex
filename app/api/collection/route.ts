import { and, eq, gt } from "drizzle-orm";
import { getDb } from "../../../db";
import { sessions, userCards, cards, users } from "../../../db/schema";

export const dynamic = "force-dynamic";
async function currentUser(request: Request) {
  const id = request.headers.get("Cookie")?.match(/(?:^|; )session=([^;]+)/)?.[1];
  if (!id) return null;
  return (await getDb().select({ user: users }).from(sessions).innerJoin(users, eq(sessions.userId, users.id)).where(and(eq(sessions.id, id), gt(sessions.expiresAt, Math.floor(Date.now() / 1000)))).get())?.user ?? null;
}
export async function GET(request: Request) {
  const user = await currentUser(request); if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const rows = await getDb().select({ card: cards, quantity: userCards.quantity }).from(userCards).innerJoin(cards, eq(userCards.cardId, cards.id)).where(eq(userCards.userId, user.id)).all();
  return Response.json({ cards: rows });
}
export async function POST(request: Request) {
  const user = await currentUser(request); if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const body = await request.json() as { cardId?: string; quantity?: number }; if (!body.cardId) return Response.json({ error: "cardId가 필요합니다." }, { status: 400 });
  await getDb().insert(userCards).values({ userId: user.id, cardId: body.cardId, quantity: Math.max(1, body.quantity ?? 1) }).onConflictDoUpdate({ target: [userCards.userId, userCards.cardId], set: { quantity: body.quantity ?? 1 } }).run();
  return Response.json({ ok: true });
}
