import { and, eq, gt, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { sessions, userCards, cards, users, userCollectionStates } from "../../../db/schema";

export const dynamic = "force-dynamic";
async function currentUser(request: Request) {
  const id = request.headers.get("Cookie")?.match(/(?:^|; )session=([^;]+)/)?.[1];
  if (!id) return null;
  return (await getDb().select({ user: users }).from(sessions).innerJoin(users, eq(sessions.userId, users.id)).where(and(eq(sessions.id, id), gt(sessions.expiresAt, Math.floor(Date.now() / 1000)))).get())?.user ?? null;
}
export async function GET(request: Request) {
  const user = await currentUser(request); if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const db = getDb();
  const rows = await db.select({ card: cards, quantity: userCards.quantity }).from(userCards).innerJoin(cards, eq(userCards.cardId, cards.id)).where(eq(userCards.userId, user.id)).all();
  const state = await db.select().from(userCollectionStates).where(eq(userCollectionStates.userId, user.id)).get();
  let showcase: (string | null)[] = [];
  try { showcase = JSON.parse(state?.showcaseJson ?? "[]"); } catch { showcase = []; }
  return Response.json({ cards: rows, state: { coin: state?.coin ?? 3000, showcase } });
}
export async function POST(request: Request) {
  const user = await currentUser(request); if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const body = await request.json() as { mode?: "delta"; cards?: { id: string; name: string; rarity: string; artworkUrl: string; quantity: number }[]; coin?: number; coinDelta?: number; showcase?: (string | null)[] };
  if (!Array.isArray(body.cards) || !body.cards.every((card) => card.id && card.name && card.rarity && card.artworkUrl && Number.isFinite(card.quantity))) return Response.json({ error: "올바른 컬렉션 데이터가 필요합니다." }, { status: 400 });
  if (!Array.isArray(body.showcase) || !body.showcase.every((card) => card === null || typeof card === "string")) return Response.json({ error: "올바른 쇼케이스 데이터가 필요합니다." }, { status: 400 });
  const db = getDb();
  for (const card of body.cards) {
    const quantity = Math.max(1, Math.floor(card.quantity));
    await db.insert(cards).values({ id: card.id, name: card.name, rarity: card.rarity, artworkUrl: card.artworkUrl }).onConflictDoUpdate({ target: cards.id, set: { name: card.name, rarity: card.rarity, artworkUrl: card.artworkUrl } }).run();
    await db.insert(userCards).values({ userId: user.id, cardId: card.id, quantity }).onConflictDoUpdate({ target: [userCards.userId, userCards.cardId], set: { quantity: body.mode === "delta" ? sql`${userCards.quantity} + ${quantity}` : quantity } }).run();
  }
  const coinDelta = Number.isFinite(body.coinDelta) ? Math.floor(body.coinDelta!) : 0;
  const legacyCoin = Math.max(0, Math.floor(body.coin ?? 3000));
  await db.insert(userCollectionStates).values({ userId: user.id, coin: body.mode === "delta" ? Math.max(0, 3000 + coinDelta) : legacyCoin, showcaseJson: JSON.stringify(body.showcase), updatedAt: new Date().toISOString() }).onConflictDoUpdate({ target: userCollectionStates.userId, set: { coin: body.mode === "delta" ? sql`MAX(0, ${userCollectionStates.coin} + ${coinDelta})` : legacyCoin, showcaseJson: JSON.stringify(body.showcase), updatedAt: new Date().toISOString() } }).run();
  return Response.json({ ok: true });
}
