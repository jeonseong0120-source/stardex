import { and, asc, eq, gt } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../db";
import { cards, marketplaceListings, sessions, userCards, userCollectionStates, users } from "../../../db/schema";
import { marketPrice } from "../../../lib/market";

export const dynamic = "force-dynamic";

async function currentUser(request: Request) {
  const id = request.headers.get("Cookie")?.match(/(?:^|; )session=([^;]+)/)?.[1];
  if (!id) return null;
  return (await getDb().select({ user: users }).from(sessions).innerJoin(users, eq(sessions.userId, users.id)).where(and(eq(sessions.id, id), gt(sessions.expiresAt, Math.floor(Date.now() / 1000)))).get())?.user ?? null;
}

async function ensureCollectionState(userId: string) {
  await getDb().insert(userCollectionStates).values({ userId, coin: 3000, showcaseJson: "[]", updatedAt: new Date().toISOString() }).onConflictDoNothing().run();
}

export async function GET(request: Request) {
  const user = await currentUser(request);
  if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const rows = await getDb().select({ listing: marketplaceListings, card: cards }).from(marketplaceListings).innerJoin(cards, eq(marketplaceListings.cardId, cards.id)).where(eq(marketplaceListings.status, "LISTED")).orderBy(asc(marketplaceListings.createdAt)).all();
  const grouped = new Map<string, { cardId: string; name: string; rarity: string; artworkUrl: string; price: number; quantity: number }>();
  const mine: { id: string; cardId: string; name: string; rarity: string; artworkUrl: string; price: number; createdAt: string }[] = [];
  for (const { listing, card } of rows) {
    if (listing.sellerId === user.id) {
      mine.push({ id: listing.id, cardId: card.id, name: card.name, rarity: card.rarity, artworkUrl: card.artworkUrl, price: listing.price, createdAt: listing.createdAt });
      continue;
    }
    const existing = grouped.get(card.id);
    if (existing) existing.quantity += 1;
    else grouped.set(card.id, { cardId: card.id, name: card.name, rarity: card.rarity, artworkUrl: card.artworkUrl, price: listing.price, quantity: 1 });
  }
  return Response.json({ listings: [...grouped.values()], myListings: mine });
}

export async function POST(request: Request) {
  const user = await currentUser(request);
  if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const body = await request.json() as { action?: "list" | "cancel" | "buy"; cardId?: string; listingId?: string };
  if (!body.action) return Response.json({ error: "요청을 확인할 수 없습니다." }, { status: 400 });
  const db = getDb();

  if (body.action === "list") {
    if (!body.cardId || !/^\d{3}$/.test(body.cardId)) return Response.json({ error: "올바른 카드가 아닙니다." }, { status: 400 });
    const card = await db.select().from(cards).where(eq(cards.id, body.cardId)).get();
    if (!card) return Response.json({ error: "존재하지 않는 카드입니다." }, { status: 404 });
    const id = crypto.randomUUID();
    const price = marketPrice(card.id, card.rarity);
    const result = await env.DB.prepare(`
      INSERT INTO marketplace_listings (id, seller_id, card_id, price, status)
      SELECT ?, ?, ?, ?, 'LISTED'
      WHERE (SELECT quantity FROM user_cards WHERE user_id = ? AND card_id = ?) > 1 +
        (SELECT COUNT(*) FROM marketplace_listings WHERE seller_id = ? AND card_id = ? AND status = 'LISTED')
    `).bind(id, user.id, card.id, price, user.id, card.id, user.id, card.id).run();
    if (result.meta.changes !== 1) return Response.json({ error: "도감 보관용 마지막 1장을 제외한 중복 카드만 등록할 수 있습니다." }, { status: 409 });
    return Response.json({ ok: true, listing: { id, cardId: card.id, price } });
  }

  if (body.action === "cancel") {
    if (!body.listingId) return Response.json({ error: "판매 등록을 선택해주세요." }, { status: 400 });
    const result = await env.DB.prepare("DELETE FROM marketplace_listings WHERE id = ? AND seller_id = ? AND status = 'LISTED'").bind(body.listingId, user.id).run();
    if (result.meta.changes !== 1) return Response.json({ error: "취소할 수 없는 판매 등록입니다." }, { status: 409 });
    return Response.json({ ok: true });
  }

  if (!body.cardId || !/^\d{3}$/.test(body.cardId)) return Response.json({ error: "구매할 카드를 선택해주세요." }, { status: 400 });
  const target = await db.select({ id: marketplaceListings.id, sellerId: marketplaceListings.sellerId }).from(marketplaceListings).where(and(eq(marketplaceListings.cardId, body.cardId), eq(marketplaceListings.status, "LISTED"))).orderBy(asc(marketplaceListings.createdAt)).all();
  const listingId = target.find((listing) => listing.sellerId !== user.id)?.id;
  if (!listingId) return Response.json({ error: "현재 구매 가능한 카드가 없습니다." }, { status: 409 });
  await ensureCollectionState(user.id);
  const buyerId = user.id;
  await env.DB.batch([
    env.DB.prepare(`
      UPDATE marketplace_listings SET status = 'SOLD', buyer_id = ?, sold_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'LISTED' AND seller_id <> ?
        AND EXISTS (SELECT 1 FROM user_cards WHERE user_id = marketplace_listings.seller_id AND card_id = marketplace_listings.card_id AND quantity >= 2)
        AND (SELECT coin FROM user_collection_states WHERE user_id = ?) >= price
    `).bind(buyerId, listingId, buyerId, buyerId),
    env.DB.prepare(`
      UPDATE user_collection_states SET coin = coin - (SELECT price FROM marketplace_listings WHERE id = ?)
      WHERE user_id = ? AND EXISTS (SELECT 1 FROM marketplace_listings WHERE id = ? AND status = 'SOLD' AND buyer_id = ?)
    `).bind(listingId, buyerId, listingId, buyerId),
    env.DB.prepare(`
      UPDATE user_cards SET quantity = quantity - 1
      WHERE user_id = (SELECT seller_id FROM marketplace_listings WHERE id = ?) AND card_id = (SELECT card_id FROM marketplace_listings WHERE id = ?)
        AND quantity >= 2 AND EXISTS (SELECT 1 FROM marketplace_listings WHERE id = ? AND status = 'SOLD' AND buyer_id = ?)
    `).bind(listingId, listingId, listingId, buyerId),
    env.DB.prepare(`
      INSERT INTO user_cards (user_id, card_id, quantity)
      SELECT ?, card_id, 1 FROM marketplace_listings WHERE id = ? AND status = 'SOLD' AND buyer_id = ?
      ON CONFLICT(user_id, card_id) DO UPDATE SET quantity = quantity + 1
    `).bind(buyerId, listingId, buyerId),
    env.DB.prepare(`
      INSERT INTO user_collection_states (user_id, coin, showcase_json, updated_at)
      SELECT seller_id, price, '[]', CURRENT_TIMESTAMP FROM marketplace_listings WHERE id = ? AND status = 'SOLD' AND buyer_id = ?
      ON CONFLICT(user_id) DO UPDATE SET coin = user_collection_states.coin + excluded.coin, updated_at = CURRENT_TIMESTAMP
    `).bind(listingId, buyerId),
  ]);
  const sold = await db.select().from(marketplaceListings).where(and(eq(marketplaceListings.id, listingId), eq(marketplaceListings.status, "SOLD"), eq(marketplaceListings.buyerId, buyerId))).get();
  if (!sold) return Response.json({ error: "이미 판매되었거나 코인이 부족합니다." }, { status: 409 });
  const state = await db.select({ coin: userCollectionStates.coin }).from(userCollectionStates).where(eq(userCollectionStates.userId, buyerId)).get();
  return Response.json({ ok: true, coin: state?.coin ?? 0, cardId: sold.cardId });
}
