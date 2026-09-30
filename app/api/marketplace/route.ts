import { and, eq, gt } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../db";
import { cards, sessions, userCards, userCollectionStates, users } from "../../../db/schema";
import { systemBuyPrice, systemSellPrice } from "../../../lib/market";
import { NORMAL_PACK_WEIGHTS } from "../../../lib/rarity";

export const dynamic = "force-dynamic";
type CardRow = { id: string; name: string; rarity: string; artworkUrl: string };
type ListingRow = { id: string; sellerId: string; cardId: string; name: string; rarity: string; artworkUrl: string; sellerName: string; createdAt: string };
type TradeRow = { id: string; listingId: string; createdAt: string; requesterName: string; offeredCardId: string; offeredName: string; offeredRarity: string; offeredArtworkUrl: string; requestedCardId: string; requestedName: string; requestedRarity: string; requestedArtworkUrl: string };

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
  const choose = (packId: "youtube" | "moe") => {
    const available = rows.filter((card) => (packId === "youtube" ? Number(card.id) <= 80 : Number(card.id) >= 81) && (NORMAL_PACK_WEIGHTS[packId][card.rarity as keyof typeof NORMAL_PACK_WEIGHTS[typeof packId]] ?? 0) > 0);
    const selected: CardRow[] = [];
    for (let slot = 0; slot < 3 && available.length; slot += 1) {
      const total = available.reduce((sum, card) => sum + (NORMAL_PACK_WEIGHTS[packId][card.rarity as keyof typeof NORMAL_PACK_WEIGHTS[typeof packId]] ?? 0), 0);
      let cursor = (hash(`${date}:${packId}:offer:${slot}`) / 0x100000000) * total;
      const index = available.findIndex((card) => (cursor -= NORMAL_PACK_WEIGHTS[packId][card.rarity as keyof typeof NORMAL_PACK_WEIGHTS[typeof packId]] ?? 0) < 0);
      selected.push(available.splice(index < 0 ? available.length - 1 : index, 1)[0]);
    }
    return selected.map((card) => ({ ...card, packId, price: systemBuyPrice(card.id, card.rarity) }));
  };
  return { date, youtube: choose("youtube"), moe: choose("moe") };
}
async function systemCatalog() { return dailyOffers(await getDb().select({ id: cards.id, name: cards.name, rarity: cards.rarity, artworkUrl: cards.artworkUrl }).from(cards).all()); }
async function notify(userId: string, type: string, title: string, body: string, cardId?: string, relatedId?: string, data: Record<string, unknown> = {}) {
  await env.DB.prepare("INSERT INTO notifications (id, user_id, type, title, body, card_id, related_id, data_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), userId, type, title, body, cardId ?? null, relatedId ?? null, JSON.stringify(data)).run();
}

export async function GET(request: Request) {
  const user = await currentUser(request); if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const active = await env.DB.prepare(`SELECT ml.id, ml.seller_id AS sellerId, ml.card_id AS cardId, ml.created_at AS createdAt, c.name, c.rarity, c.artwork_url AS artworkUrl, u.name AS sellerName FROM marketplace_listings ml JOIN cards c ON c.id = ml.card_id JOIN users u ON u.id = ml.seller_id WHERE ml.status = 'LISTED' ORDER BY ml.created_at ASC`).all<ListingRow>();
  const selectTrades = `SELECT tr.id, tr.listing_id AS listingId, tr.created_at AS createdAt, u.name AS requesterName, offered.id AS offeredCardId, offered.name AS offeredName, offered.rarity AS offeredRarity, offered.artwork_url AS offeredArtworkUrl, requested.id AS requestedCardId, requested.name AS requestedName, requested.rarity AS requestedRarity, requested.artwork_url AS requestedArtworkUrl FROM trade_requests tr JOIN users u ON u.id = tr.requester_id JOIN cards offered ON offered.id = tr.offered_card_id JOIN cards requested ON requested.id = tr.requested_card_id`;
  const incoming = await env.DB.prepare(`${selectTrades} WHERE tr.recipient_id = ? AND tr.status = 'PENDING' ORDER BY tr.created_at ASC`).bind(user.id).all<TradeRow>();
  const sent = await env.DB.prepare(`${selectTrades} WHERE tr.requester_id = ? AND tr.status = 'PENDING' ORDER BY tr.created_at ASC`).bind(user.id).all<TradeRow>();
  const rows = active.results ?? [];
  return Response.json({ listings: rows.filter((listing) => listing.sellerId !== user.id), myListings: rows.filter((listing) => listing.sellerId === user.id), incomingRequests: incoming.results ?? [], sentRequests: sent.results ?? [], systemOffers: await systemCatalog() });
}

export async function POST(request: Request) {
  const user = await currentUser(request); if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const body = await request.json() as { action?: "list" | "cancel" | "request" | "accept" | "decline" | "cancel-request" | "system-buy" | "system-sell"; cardId?: string; listingId?: string; requestId?: string; offeredCardId?: string };
  if (!body.action) return Response.json({ error: "요청을 확인할 수 없습니다." }, { status: 400 });
  const db = getDb();

  if (body.action === "system-buy") {
    if (!body.cardId || !/^\d{3}$/.test(body.cardId)) return Response.json({ error: "올바른 카드가 아닙니다." }, { status: 400 });
    const offers = await systemCatalog(); const offer = [...offers.youtube, ...offers.moe].find((item) => item.id === body.cardId);
    if (!offer) return Response.json({ error: "오늘의 판매 카드가 아닙니다." }, { status: 409 });
    await ensureCollectionState(user.id);
    const paid = await env.DB.prepare("UPDATE user_collection_states SET coin = coin - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND coin >= ?").bind(offer.price, user.id, offer.price).run();
    if (paid.meta.changes !== 1) return Response.json({ error: "잔액이 부족합니다." }, { status: 409 });
    await db.insert(userCards).values({ userId: user.id, cardId: offer.id, quantity: 1 }).onConflictDoUpdate({ target: [userCards.userId, userCards.cardId], set: { quantity: userCards.quantity + 1 } }).run();
    await notify(user.id, "SYSTEM_PURCHASE", "구매 완료", `${offer.name} ${offer.rarity} 카드를 구매했습니다.`, offer.id, offer.id, { price: offer.price });
    return Response.json({ ok: true, cardId: offer.id, price: offer.price });
  }
  if (body.action === "system-sell") {
    if (!body.cardId || !/^\d{3}$/.test(body.cardId)) return Response.json({ error: "올바른 카드가 아닙니다." }, { status: 400 });
    const card = await db.select().from(cards).where(eq(cards.id, body.cardId)).get(); if (!card) return Response.json({ error: "존재하지 않는 카드입니다." }, { status: 404 });
    await ensureCollectionState(user.id);
    const sold = await env.DB.prepare(`UPDATE user_cards SET quantity = quantity - 1 WHERE user_id = ? AND card_id = ? AND quantity > 1 + (SELECT COUNT(*) FROM marketplace_listings WHERE seller_id = ? AND card_id = ? AND status = 'LISTED') + (SELECT COUNT(*) FROM trade_requests WHERE requester_id = ? AND offered_card_id = ? AND status = 'PENDING')`).bind(user.id, card.id, user.id, card.id, user.id, card.id).run();
    if (sold.meta.changes !== 1) return Response.json({ error: "교환에 등록되었거나 대기 중인 카드를 제외하면 판매할 중복 카드가 없습니다." }, { status: 409 });
    const price = systemSellPrice(card.id, card.rarity);
    await env.DB.prepare("UPDATE user_collection_states SET coin = coin + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?").bind(price, user.id).run();
    await notify(user.id, "SYSTEM_SALE", "판매 완료", `${card.name} ${card.rarity} 카드를 시스템에 판매했습니다.`, card.id, card.id, { price });
    return Response.json({ ok: true, cardId: card.id, price });
  }
  if (body.action === "list") {
    if (!body.cardId || !/^\d{3}$/.test(body.cardId)) return Response.json({ error: "올바른 카드가 아닙니다." }, { status: 400 });
    const card = await db.select().from(cards).where(eq(cards.id, body.cardId)).get(); if (!card) return Response.json({ error: "존재하지 않는 카드입니다." }, { status: 404 });
    const id = crypto.randomUUID();
    const result = await env.DB.prepare(`INSERT INTO marketplace_listings (id, seller_id, card_id, price, status) SELECT ?, ?, ?, 0, 'LISTED' WHERE (SELECT COALESCE(quantity, 0) FROM user_cards WHERE user_id = ? AND card_id = ?) > 1 + (SELECT COUNT(*) FROM marketplace_listings WHERE seller_id = ? AND card_id = ? AND status = 'LISTED') + (SELECT COUNT(*) FROM trade_requests WHERE requester_id = ? AND offered_card_id = ? AND status = 'PENDING')`).bind(id, user.id, card.id, user.id, card.id, user.id, card.id, user.id, card.id).run();
    if (result.meta.changes !== 1) return Response.json({ error: "도감 보관용 마지막 한 장과 대기 중인 카드를 제외하면 등록할 카드가 없습니다." }, { status: 409 });
    await notify(user.id, "TRADE_LISTED", "교환 카드 등록", `${card.name} ${card.rarity} 카드를 교환 목록에 등록했습니다.`, card.id, id);
    return Response.json({ ok: true, listing: { id, cardId: card.id } });
  }
  if (body.action === "cancel") {
    if (!body.listingId) return Response.json({ error: "교환 등록을 선택해주세요." }, { status: 400 });
    const result = await env.DB.prepare("DELETE FROM marketplace_listings WHERE id = ? AND seller_id = ? AND status = 'LISTED' AND NOT EXISTS (SELECT 1 FROM trade_requests WHERE listing_id = marketplace_listings.id AND status = 'PENDING')").bind(body.listingId, user.id).run();
    if (result.meta.changes !== 1) return Response.json({ error: "대기 중인 교환 신청이 있어 등록을 취소할 수 없습니다." }, { status: 409 });
    await notify(user.id, "TRADE_CANCELLED", "교환 등록 취소", "교환 카드 등록을 취소했습니다.", undefined, body.listingId);
    return Response.json({ ok: true });
  }
  if (body.action === "request") {
    if (!body.listingId || !body.offeredCardId || !/^\d{3}$/.test(body.offeredCardId)) return Response.json({ error: "교환할 내 카드를 선택해주세요." }, { status: 400 });
    const id = crypto.randomUUID();
    const result = await env.DB.prepare(`INSERT INTO trade_requests (id, listing_id, requester_id, recipient_id, offered_card_id, requested_card_id, status) SELECT ?, ml.id, ?, ml.seller_id, ?, ml.card_id, 'PENDING' FROM marketplace_listings ml WHERE ml.id = ? AND ml.status = 'LISTED' AND ml.seller_id <> ? AND NOT EXISTS (SELECT 1 FROM trade_requests pending WHERE pending.listing_id = ml.id AND pending.status = 'PENDING') AND (SELECT COALESCE(quantity, 0) FROM user_cards WHERE user_id = ? AND card_id = ?) > 1 + (SELECT COUNT(*) FROM marketplace_listings WHERE seller_id = ? AND card_id = ? AND status = 'LISTED') + (SELECT COUNT(*) FROM trade_requests WHERE requester_id = ? AND offered_card_id = ? AND status = 'PENDING')`).bind(id, user.id, body.offeredCardId, body.listingId, user.id, user.id, body.offeredCardId, user.id, body.offeredCardId, user.id, body.offeredCardId).run();
    if (result.meta.changes !== 1) return Response.json({ error: "이미 처리 중인 카드이거나 교환 신청을 보낼 수 없습니다." }, { status: 409 });
    const requested = await env.DB.prepare("SELECT ml.seller_id AS recipientId, requested.name AS requestedName, requested.rarity AS requestedRarity, requested.artwork_url AS requestedArtworkUrl, offered.name AS offeredName, offered.rarity AS offeredRarity, offered.artwork_url AS offeredArtworkUrl, u.name AS requesterName FROM marketplace_listings ml JOIN cards requested ON requested.id = ml.card_id JOIN cards offered ON offered.id = ? JOIN users u ON u.id = ? WHERE ml.id = ?").bind(body.offeredCardId, user.id, body.listingId).first<{ recipientId: string; requestedName: string; requestedRarity: string; requestedArtworkUrl: string; offeredName: string; offeredRarity: string; offeredArtworkUrl: string; requesterName: string }>();
    if (requested) await notify(requested.recipientId, "TRADE_REQUEST", "새 교환 요청", `${requested.requesterName}님이 ${requested.offeredName} ${requested.offeredRarity} 카드를 제시했습니다.`, body.offeredCardId, id, { offeredName: requested.offeredName, offeredRarity: requested.offeredRarity, offeredArtworkUrl: requested.offeredArtworkUrl, requestedName: requested.requestedName, requestedRarity: requested.requestedRarity, requestedArtworkUrl: requested.requestedArtworkUrl, requesterName: requested.requesterName, requestId: id });
    return Response.json({ ok: true, requestId: id });
  }
  if (body.action === "cancel-request" || body.action === "decline") {
    if (!body.requestId) return Response.json({ error: "교환 신청을 선택해주세요." }, { status: 400 });
    const column = body.action === "decline" ? "recipient_id" : "requester_id";
    const status = body.action === "decline" ? "DECLINED" : "CANCELLED";
    const result = await env.DB.prepare(`UPDATE trade_requests SET status = '${status}', responded_at = CURRENT_TIMESTAMP WHERE id = ? AND ${column} = ? AND status = 'PENDING'`).bind(body.requestId, user.id).run();
    if (result.meta.changes !== 1) return Response.json({ error: "처리할 수 없는 교환 신청입니다." }, { status: 409 });
    if (body.action === "decline") {
      const declined = await env.DB.prepare("SELECT requester_id AS requesterId, offered_card_id AS cardId FROM trade_requests WHERE id = ?").bind(body.requestId).first<{ requesterId: string; cardId: string }>();
      if (declined) await notify(declined.requesterId, "TRADE_DECLINED", "교환 요청 거절", "보낸 교환 요청이 거절되었습니다.", declined.cardId, body.requestId);
    }
    return Response.json({ ok: true });
  }
  if (body.action === "accept") {
    if (!body.requestId) return Response.json({ error: "교환 신청을 선택해주세요." }, { status: 400 });
    await env.DB.batch([
      env.DB.prepare(`UPDATE trade_requests SET status = 'ACCEPTED', responded_at = CURRENT_TIMESTAMP WHERE id = ? AND recipient_id = ? AND status = 'PENDING' AND EXISTS (SELECT 1 FROM marketplace_listings ml WHERE ml.id = trade_requests.listing_id AND ml.status = 'LISTED' AND ml.seller_id = trade_requests.recipient_id) AND (SELECT COALESCE(quantity, 0) FROM user_cards WHERE user_id = trade_requests.recipient_id AND card_id = trade_requests.requested_card_id) > 1 AND (SELECT COALESCE(quantity, 0) FROM user_cards WHERE user_id = trade_requests.requester_id AND card_id = trade_requests.offered_card_id) > 1`).bind(body.requestId, user.id),
      env.DB.prepare("UPDATE marketplace_listings SET status = 'TRADED', buyer_id = (SELECT requester_id FROM trade_requests WHERE id = ?), sold_at = CURRENT_TIMESTAMP WHERE id = (SELECT listing_id FROM trade_requests WHERE id = ?) AND status = 'LISTED' AND EXISTS (SELECT 1 FROM trade_requests WHERE id = ? AND status = 'ACCEPTED')").bind(body.requestId, body.requestId, body.requestId),
      env.DB.prepare("UPDATE user_cards SET quantity = quantity - 1 WHERE user_id = (SELECT recipient_id FROM trade_requests WHERE id = ?) AND card_id = (SELECT requested_card_id FROM trade_requests WHERE id = ?) AND quantity > 1 AND EXISTS (SELECT 1 FROM trade_requests WHERE id = ? AND status = 'ACCEPTED')").bind(body.requestId, body.requestId, body.requestId),
      env.DB.prepare("INSERT INTO user_cards (user_id, card_id, quantity) SELECT requester_id, requested_card_id, 1 FROM trade_requests WHERE id = ? AND status = 'ACCEPTED' ON CONFLICT(user_id, card_id) DO UPDATE SET quantity = quantity + 1").bind(body.requestId),
      env.DB.prepare("UPDATE user_cards SET quantity = quantity - 1 WHERE user_id = (SELECT requester_id FROM trade_requests WHERE id = ?) AND card_id = (SELECT offered_card_id FROM trade_requests WHERE id = ?) AND quantity > 1 AND EXISTS (SELECT 1 FROM trade_requests WHERE id = ? AND status = 'ACCEPTED')").bind(body.requestId, body.requestId, body.requestId),
      env.DB.prepare("INSERT INTO user_cards (user_id, card_id, quantity) SELECT recipient_id, offered_card_id, 1 FROM trade_requests WHERE id = ? AND status = 'ACCEPTED' ON CONFLICT(user_id, card_id) DO UPDATE SET quantity = quantity + 1").bind(body.requestId),
    ]);
    const accepted = await env.DB.prepare("SELECT id FROM trade_requests WHERE id = ? AND recipient_id = ? AND status = 'ACCEPTED'").bind(body.requestId, user.id).first();
    if (!accepted) return Response.json({ error: "카드 보유 상태가 바뀌어 교환을 수락할 수 없습니다." }, { status: 409 });
    const completed = await env.DB.prepare("SELECT requester_id AS requesterId, recipient_id AS recipientId, offered_card_id AS offeredCardId, requested_card_id AS requestedCardId, offered.name AS offeredName, requested.name AS requestedName FROM trade_requests tr JOIN cards offered ON offered.id = tr.offered_card_id JOIN cards requested ON requested.id = tr.requested_card_id WHERE tr.id = ?").bind(body.requestId).first<{ requesterId: string; recipientId: string; offeredCardId: string; requestedCardId: string; offeredName: string; requestedName: string }>();
    if (completed) {
      await Promise.all([
        notify(completed.requesterId, "TRADE_ACCEPTED", "교환 완료", `${completed.requestedName} 카드를 받았습니다.`, completed.requestedCardId, body.requestId),
        notify(completed.recipientId, "TRADE_ACCEPTED", "교환 완료", `${completed.offeredName} 카드를 받았습니다.`, completed.offeredCardId, body.requestId),
      ]);
    }
    return Response.json({ ok: true });
  }
  return Response.json({ error: "지원하지 않는 거래 요청입니다." }, { status: 400 });
}
