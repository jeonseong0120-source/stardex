import { and, asc, eq, gt } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../db";
import { cards, marketplaceListings, sessions, userCards, userCollectionStates, users } from "../../../db/schema";
import { marketPrice, systemBuyPrice, systemSellPrice } from "../../../lib/market";

export const dynamic = "force-dynamic";
type CardRow = { id: string; name: string; rarity: string; artworkUrl: string };

async function currentUser(request: Request) {
  const id = request.headers.get("Cookie")?.match(/(?:^|; )session=([^;]+)/)?.[1];
  if (!id) return null;
  return (await getDb().select({ user: users }).from(sessions).innerJoin(users, eq(sessions.userId, users.id)).where(and(eq(sessions.id, id), gt(sessions.expiresAt, Math.floor(Date.now() / 1000)))).get())?.user ?? null;
}
async function ensureCollectionState(userId: string) { await getDb().insert(userCollectionStates).values({ userId, coin: 3000, showcaseJson: "[]", updatedAt: new Date().toISOString() }).onConflictDoNothing().run(); }
function todayKst() { return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); }
function hash(input: string) { let value = 2166136261; for (let index = 0; index < input.length; index += 1) value = Math.imul(value ^ input.charCodeAt(index), 16777619); return value >>> 0; }
function dailyOffers(rows: CardRow[]) {
  const date = todayKst();
  const choose = (packId: "youtube" | "moe") => [...rows].filter((card) => packId === "youtube" ? Number(card.id) <= 80 : Number(card.id) >= 81).sort((left, right) => hash(`${date}:${packId}:${left.id}`) - hash(`${date}:${packId}:${right.id}`)).slice(0, 5).map((card) => ({ ...card, packId, price: systemBuyPrice(card.id, card.rarity) }));
  return { date, youtube: choose("youtube"), moe: choose("moe") };
}
async function systemCatalog() { return dailyOffers(await getDb().select({ id: cards.id, name: cards.name, rarity: cards.rarity, artworkUrl: cards.artworkUrl }).from(cards).all()); }

export async function GET(request: Request) {
  const user = await currentUser(request); if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const rows = await getDb().select({ listing: marketplaceListings, card: cards }).from(marketplaceListings).innerJoin(cards, eq(marketplaceListings.cardId, cards.id)).where(eq(marketplaceListings.status, "LISTED")).orderBy(asc(marketplaceListings.createdAt)).all();
  const grouped = new Map<string, { cardId: string; name: string; rarity: string; artworkUrl: string; price: number; quantity: number }>();
  const mine: { id: string; cardId: string; name: string; rarity: string; artworkUrl: string; price: number; createdAt: string }[] = [];
  for (const { listing, card } of rows) {
    if (listing.sellerId === user.id) mine.push({ id: listing.id, cardId: card.id, name: card.name, rarity: card.rarity, artworkUrl: card.artworkUrl, price: listing.price, createdAt: listing.createdAt });
    else { const existing = grouped.get(card.id); if (existing) existing.quantity += 1; else grouped.set(card.id, { cardId: card.id, name: card.name, rarity: card.rarity, artworkUrl: card.artworkUrl, price: listing.price, quantity: 1 }); }
  }
  return Response.json({ listings: [...grouped.values()], myListings: mine, systemOffers: await systemCatalog() });
}

export async function POST(request: Request) {
  const user = await currentUser(request); if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const body = await request.json() as { action?: "list" | "cancel" | "buy" | "system-buy" | "system-sell"; cardId?: string; listingId?: string };
  if (!body.action) return Response.json({ error: "요청을 확인할 수 없습니다." }, { status: 400 });
  const db = getDb();

  if (body.action === "system-buy") {
    if (!body.cardId || !/^\d{3}$/.test(body.cardId)) return Response.json({ error: "올바른 카드가 아닙니다." }, { status: 400 });
    const offers = await systemCatalog(); const offer = [...offers.youtube, ...offers.moe].find((item) => item.id === body.cardId);
    if (!offer) return Response.json({ error: "오늘의 판매 카드가 아닙니다." }, { status: 409 });
    await ensureCollectionState(user.id);
    const paid = await env.DB.prepare("UPDATE user_collection_states SET coin = coin - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND coin >= ?").bind(offer.price, user.id, offer.price).run();
    if (paid.meta.changes !== 1) return Response.json({ error: "코인이 부족합니다." }, { status: 409 });
    await db.insert(userCards).values({ userId: user.id, cardId: offer.id, quantity: 1 }).onConflictDoUpdate({ target: [userCards.userId, userCards.cardId], set: { quantity: userCards.quantity + 1 } }).run();
    return Response.json({ ok: true, cardId: offer.id, price: offer.price });
  }

  if (body.action === "system-sell") {
    if (!body.cardId || !/^\d{3}$/.test(body.cardId)) return Response.json({ error: "올바른 카드가 아닙니다." }, { status: 400 });
    const card = await db.select().from(cards).where(eq(cards.id, body.cardId)).get(); if (!card) return Response.json({ error: "존재하지 않는 카드입니다." }, { status: 404 });
    await ensureCollectionState(user.id);
    const sold = await env.DB.prepare("UPDATE user_cards SET quantity = quantity - 1 WHERE user_id = ? AND card_id = ? AND quantity >= 2").bind(user.id, card.id).run();
    if (sold.meta.changes !== 1) return Response.json({ error: "도감 보관용 마지막 한 장을 제외한 중복 카드만 판매할 수 있습니다." }, { status: 409 });
    const price = systemSellPrice(card.id, card.rarity);
    await env.DB.prepare("UPDATE user_collection_states SET coin = coin + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?").bind(price, user.id).run();
    return Response.json({ ok: true, cardId: card.id, price });
  }

  if (body.action === "list") {
    if (!body.cardId || !/^\d{3}$/.test(body.cardId)) return Response.json({ error: "올바른 카드가 아닙니다." }, { status: 400 });
    const card = await db.select().from(cards).where(eq(cards.id, body.cardId)).get(); if (!card) return Response.json({ error: "존재하지 않는 카드입니다." }, { status: 404 });
    const id = crypto.randomUUID(), price = marketPrice(card.id, card.rarity);
    const result = await env.DB.prepare(`INSERT INTO marketplace_listings (id, seller_id, card_id, price, status) SELECT ?, ?, ?, ?, 'LISTED' WHERE (SELECT quantity FROM user_cards WHERE user_id = ? AND card_id = ?) > 1 + (SELECT COUNT(*) FROM marketplace_listings WHERE seller_id = ? AND card_id = ? AND status = 'LISTED')`).bind(id, user.id, card.id, price, user.id, card.id, user.id, card.id).run();
    if (result.meta.changes !== 1) return Response.json({ error: "도감 보관용 마지막 한 장을 제외한 중복 카드만 등록할 수 있습니다." }, { status: 409 });
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
  const listingId = target.find((listing) => listing.sellerId !== user.id)?.id; if (!listingId) return Response.json({ error: "현재 구매 가능한 카드가 없습니다." }, { status: 409 });
  await ensureCollectionState(user.id);
  await env.DB.batch([
    env.DB.prepare("UPDATE marketplace_listings SET status = 'SOLD', buyer_id = ?, sold_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'LISTED' AND seller_id <> ? AND EXISTS (SELECT 1 FROM user_cards WHERE user_id = marketplace_listings.seller_id AND card_id = marketplace_listings.card_id AND quantity >= 2) AND (SELECT coin FROM user_collection_states WHERE user_id = ?) >= price").bind(user.id, listingId, user.id, user.id),
    env.DB.prepare("UPDATE user_collection_states SET coin = coin - (SELECT price FROM marketplace_listings WHERE id = ?) WHERE user_id = ? AND EXISTS (SELECT 1 FROM marketplace_listings WHERE id = ? AND status = 'SOLD' AND buyer_id = ?)").bind(listingId, user.id, listingId, user.id),
    env.DB.prepare("UPDATE user_cards SET quantity = quantity - 1 WHERE user_id = (SELECT seller_id FROM marketplace_listings WHERE id = ?) AND card_id = (SELECT card_id FROM marketplace_listings WHERE id = ?) AND quantity >= 2 AND EXISTS (SELECT 1 FROM marketplace_listings WHERE id = ? AND status = 'SOLD' AND buyer_id = ?)").bind(listingId, listingId, listingId, user.id),
    env.DB.prepare("INSERT INTO user_cards (user_id, card_id, quantity) SELECT ?, card_id, 1 FROM marketplace_listings WHERE id = ? AND status = 'SOLD' AND buyer_id = ? ON CONFLICT(user_id, card_id) DO UPDATE SET quantity = quantity + 1").bind(user.id, listingId, user.id),
    env.DB.prepare("INSERT INTO user_collection_states (user_id, coin, showcase_json, updated_at) SELECT seller_id, price, '[]', CURRENT_TIMESTAMP FROM marketplace_listings WHERE id = ? AND status = 'SOLD' AND buyer_id = ? ON CONFLICT(user_id) DO UPDATE SET coin = user_collection_states.coin + excluded.coin, updated_at = CURRENT_TIMESTAMP").bind(listingId, user.id),
  ]);
  const sold = await db.select().from(marketplaceListings).where(and(eq(marketplaceListings.id, listingId), eq(marketplaceListings.status, "SOLD"), eq(marketplaceListings.buyerId, user.id))).get();
  if (!sold) return Response.json({ error: "이미 판매되었거나 코인이 부족합니다." }, { status: 409 });
  return Response.json({ ok: true, cardId: sold.cardId });
}
