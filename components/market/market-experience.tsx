"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { CollectionCard } from "../collection/collection-experience";
import { systemSellPrice } from "../../lib/market";

type Listing = { id: string; cardId: string; name: string; rarity: string; artworkUrl: string; sellerName: string; createdAt: string };
type TradeRequest = { id: string; listingId: string; createdAt: string; requesterName: string; offeredCardId: string; offeredName: string; offeredRarity: string; offeredArtworkUrl: string; requestedCardId: string; requestedName: string; requestedRarity: string; requestedArtworkUrl: string };
type SystemOffer = { id: string; name: string; rarity: string; artworkUrl: string; price: number; packId: "youtube" | "moe" };
type Props = { cards: CollectionCard[]; quantities: Map<string, number>; coin: number; renderCard: (card: CollectionCard, serial: number) => ReactNode; onCollectionRefresh: () => Promise<void> };
const labels: Record<string, string> = { COMMON: "C", RARE: "R", "SUPER RARE": "SR", MR: "MR", UR: "UR", BR: "BR" };
const rarityOptions = ["ALL", "RARE", "SUPER RARE", "MR", "UR", "BR"];
const displayCardName = (name: string) => name.replace(/\s+C$/, "");

export function MarketExperience({ cards, quantities, coin, renderCard, onCollectionRefresh }: Props) {
  const [section, setSection] = useState<"shop" | "sell" | "exchange">("shop");
  const [exchangeTab, setExchangeTab] = useState<"browse" | "list" | "sent" | "incoming">("browse");
  const [series, setSeries] = useState<"youtube" | "moe">("youtube");
  const [listings, setListings] = useState<Listing[]>([]), [myListings, setMyListings] = useState<Listing[]>([]), [incomingRequests, setIncomingRequests] = useState<TradeRequest[]>([]), [sentRequests, setSentRequests] = useState<TradeRequest[]>([]), [offers, setOffers] = useState<{ date: string; youtube: SystemOffer[]; moe: SystemOffer[] }>({ date: "", youtube: [], moe: [] });
  const [rarity, setRarity] = useState("ALL"), [query, setQuery] = useState(""), [pending, setPending] = useState<string | null>(null), [notice, setNotice] = useState<string | null>(null), [toast, setToast] = useState<string | null>(null), [loaded, setLoaded] = useState(false), [selectedListing, setSelectedListing] = useState<Listing | null>(null), [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const notifiedIncoming = useRef(0);
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(null), 3000); };
  const refreshMarket = async () => {
    const response = await fetch("/api/marketplace");
    if (!response.ok) { setNotice("거래소를 불러오지 못했습니다. 로그인 상태를 확인해주세요."); return; }
    const data = await response.json() as { listings: Listing[]; myListings: Listing[]; incomingRequests: TradeRequest[]; sentRequests: TradeRequest[]; systemOffers: typeof offers };
    setListings(data.listings); setMyListings(data.myListings); setIncomingRequests(data.incomingRequests); setSentRequests(data.sentRequests); setOffers(data.systemOffers); setLoaded(true);
    if (data.incomingRequests.length > notifiedIncoming.current) showToast(`새 교환 요청이 ${data.incomingRequests.length}건 도착했습니다.`);
    notifiedIncoming.current = data.incomingRequests.length;
  };
  useEffect(() => { const initial = window.setTimeout(() => void refreshMarket(), 0), retry = window.setTimeout(() => void refreshMarket(), 900); return () => { window.clearTimeout(initial); window.clearTimeout(retry); }; }, []);
  const listedByCard = useMemo(() => myListings.reduce((map, item) => map.set(item.cardId, (map.get(item.cardId) ?? 0) + 1), new Map<string, number>()), [myListings]);
  const requestedByCard = useMemo(() => sentRequests.reduce((map, item) => map.set(item.offeredCardId, (map.get(item.offeredCardId) ?? 0) + 1), new Map<string, number>()), [sentRequests]);
  const matches = <T extends { name: string; rarity: string }>(items: T[]) => items.filter((item) => (rarity === "ALL" || item.rarity === rarity) && (!query.trim() || item.name.toLowerCase().includes(query.trim().toLowerCase())));
  const matchesTrade = (items: TradeRequest[]) => items.filter((item) => (rarity === "ALL" || item.offeredRarity === rarity || item.requestedRarity === rarity) && (!query.trim() || `${item.offeredName} ${item.requestedName}`.toLowerCase().includes(query.trim().toLowerCase())));
  const duplicates = useMemo(() => cards.filter((card) => (quantities.get(card.no) ?? 0) > 1), [cards, quantities]);
  const listable = useMemo(() => duplicates.filter((card) => (quantities.get(card.no) ?? 0) > 1 + (listedByCard.get(card.no) ?? 0) + (requestedByCard.get(card.no) ?? 0)), [duplicates, listedByCard, quantities, requestedByCard]);
  const cardOf = (id: string) => cards.find((card) => card.no === id);
  const perform = async (action: "list" | "cancel" | "request" | "accept" | "decline" | "cancel-request" | "system-buy" | "system-sell", key: string, offeredCardId?: string) => {
    setPending(`${action}:${key}`); setNotice(null);
    try {
      const payload = action === "cancel" ? { action, listingId: key } : action === "request" ? { action, listingId: key, offeredCardId } : ["accept", "decline", "cancel-request"].includes(action) ? { action, requestId: key } : { action, cardId: key };
      const response = await fetch("/api/marketplace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json() as { error?: string };
      if (!response.ok) { setNotice(data.error ?? "거래를 완료하지 못했습니다."); return; }
      if (action === "request") setSelectedListing(null);
      await Promise.all([refreshMarket(), onCollectionRefresh()]);
      const messages: Record<string, string> = { "system-buy": "오늘의 카드 구매 완료. 컬렉션에 추가되었습니다.", "system-sell": "시스템 매입이 완료되었습니다. 원을 받았습니다.", list: "교환 가능 카드로 등록했습니다.", cancel: "교환 등록을 취소했습니다.", request: "교환 신청을 보냈습니다. 상대방의 수락을 기다려주세요.", accept: "교환이 완료되었습니다. 카드가 서로의 컬렉션으로 이동했습니다.", decline: "교환 요청을 거절했습니다.", "cancel-request": "보낸 교환 신청을 취소했습니다." };
      showToast(messages[action]);
    } catch { setNotice("네트워크 문제로 거래를 완료하지 못했습니다."); } finally { setPending(null); }
  };
  const currentOffers = offers[series];
  const selectedTargetCard = selectedListing ? cardOf(selectedListing.cardId) : undefined;
  const selectedOfferCard = listable.find((card) => card.no === selectedOffer);
  const renderFilters = () => <div className="market-toolbar"><div>{rarityOptions.map((item) => <button key={item} className={rarity === item ? "is-active" : ""} onClick={() => setRarity(item)}>{item === "ALL" ? "전체" : labels[item]}</button>)}</div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="카드 이름 검색" aria-label="카드 이름 검색" /></div>;

  return <section className="market-experience">
    <header className="market-hero"><div><p className="market-hero__eyebrow">거래소</p><h1>EXCHANGE</h1><p>{section === "shop" ? "오늘의 시스템 카드로 컬렉션을 완성하세요." : section === "sell" ? "중복 카드를 시스템에 즉시 판매하고 원을 받으세요." : "코인 없이, 카드와 카드로 안전하게 교환하세요."}</p></div><aside><span>내 보유 잔액</span><strong>{coin.toLocaleString()}원</strong><small>유저 교환 수수료 0%</small></aside></header>
    <div className="market-mode-tabs" role="tablist" aria-label="거래소 구분"><button className={section === "shop" ? "is-active" : ""} onClick={() => setSection("shop")}>구매 <small>SYSTEM SHOP</small></button><button className={section === "sell" ? "is-active" : ""} onClick={() => setSection("sell")}>판매 <small>SYSTEM BUYBACK</small></button><button className={section === "exchange" ? "is-active" : ""} onClick={() => setSection("exchange")}>교환 <small>PLAYER EXCHANGE</small></button></div>
    {section === "shop" ? <>
      <div className="system-heading"><div><span>DAILY SELECTION · {offers.date || "LOADING"}</span><h2>오늘의 구매 카드</h2><p>매일 자정(KST), 각 시리즈별 세 장이 새롭게 공개됩니다.</p></div><div className="system-series-tabs"><button className={series === "youtube" ? "is-active" : ""} onClick={() => setSeries("youtube")}>크리에이터 팩</button><button className={series === "moe" ? "is-active" : ""} onClick={() => setSeries("moe")}>모에몬 팩</button></div></div>
      {renderFilters()}{notice && <p className="market-notice" role="status">{notice}</p>}
      {!loaded ? <p className="market-empty">오늘의 카드를 준비하고 있습니다.</p> : <MarketGrid>{matches(currentOffers).map((offer, index) => { const card = cardOf(offer.id); return card && <CardTile key={offer.id} card={card} serial={index + 1300} renderCard={renderCard}><strong>{displayCardName(offer.name)}</strong><b>{offer.price.toLocaleString()}원</b><span>시스템 판매</span><button disabled={coin < offer.price || pending === `system-buy:${offer.id}`} onClick={() => void perform("system-buy", offer.id)}>구매하기</button></CardTile>; })}</MarketGrid>}
    </> : section === "sell" ? <>
      <section className="system-buyback"><div><span>SYSTEM BUYBACK</span><h2>중복 카드 즉시 매입</h2><p>도감 보관용 마지막 한 장은 남기고, 중복 카드만 즉시 원으로 바꿀 수 있습니다.</p></div><small>매입가 · 기준 시세의 60%</small></section>
      {renderFilters()}{notice && <p className="market-notice" role="status">{notice}</p>}
      <MarketGrid>{matches(duplicates).map((card, index) => { const held = quantities.get(card.no) ?? 0, locked = (listedByCard.get(card.no) ?? 0) + (requestedByCard.get(card.no) ?? 0), sellable = Math.max(0, held - 1 - locked), price = systemSellPrice(card.no, card.rarity); return <CardTile key={card.no} card={card} serial={index + 1500} renderCard={renderCard}><strong>{displayCardName(card.name)}</strong><b>{price.toLocaleString()}원</b><span>보유 {held}장 · 즉시 판매 {sellable}장</span><button disabled={!sellable || pending === `system-sell:${card.no}`} onClick={() => void perform("system-sell", card.no)}>즉시 판매</button></CardTile>; })}</MarketGrid>
    </> : <>
      <div className="market-tabs" role="tablist" aria-label="유저 교환 메뉴"><button className={exchangeTab === "browse" ? "is-active" : ""} onClick={() => setExchangeTab("browse")}>교환 목록 <i>{listings.length}</i></button><button className={exchangeTab === "list" ? "is-active" : ""} onClick={() => setExchangeTab("list")}>카드 등록</button><button className={exchangeTab === "sent" ? "is-active" : ""} onClick={() => setExchangeTab("sent")}>보낸 요청 <i>{sentRequests.length}</i></button><button className={exchangeTab === "incoming" ? "is-active" : ""} onClick={() => setExchangeTab("incoming")}>받은 요청 <i>{incomingRequests.length}</i></button></div>
      {renderFilters()}{notice && <p className="market-notice" role="status">{notice}</p>}
      {!loaded ? <p className="market-empty">교환소를 준비하고 있습니다.</p> : exchangeTab === "browse" ? <MarketGrid>{matches(listings).map((listing, index) => { const card = cardOf(listing.cardId); return card && <CardTile key={listing.id} card={card} serial={index + 700} renderCard={renderCard}><strong>{displayCardName(listing.name)}</strong><b>{listing.sellerName}님의 카드</b><span>카드 ↔ 카드 · 코인 사용 없음</span><button onClick={() => { setSelectedListing(listing); setSelectedOffer(listable[0]?.no ?? null); }}>교환 신청</button></CardTile>; })}</MarketGrid> : exchangeTab === "list" ? <MarketGrid>{matches(listable).map((card, index) => { const held = quantities.get(card.no) ?? 0, available = held - 1 - (listedByCard.get(card.no) ?? 0) - (requestedByCard.get(card.no) ?? 0); return <CardTile key={card.no} card={card} serial={index + 900} renderCard={renderCard}><strong>{displayCardName(card.name)}</strong><b>등록 가능 {available}장</b><span>도감 보관용 마지막 1장 보호</span><button disabled={pending === `list:${card.no}`} onClick={() => void perform("list", card.no)}>교환 가능 카드로 등록</button></CardTile>; })}</MarketGrid> : exchangeTab === "sent" ? <TradeGrid requests={matchesTrade(sentRequests)} direction="sent" onAction={(action, id) => void perform(action, id)} pending={pending} /> : <TradeGrid requests={matchesTrade(incomingRequests)} direction="incoming" onAction={(action, id) => void perform(action, id)} pending={pending} />}
      {loaded && ((exchangeTab === "browse" && !matches(listings).length) || (exchangeTab === "list" && !matches(listable).length) || (exchangeTab === "sent" && !matchesTrade(sentRequests).length) || (exchangeTab === "incoming" && !matchesTrade(incomingRequests).length)) && <p className="market-empty">{exchangeTab === "browse" ? "현재 교환 가능한 카드가 없습니다." : exchangeTab === "list" ? "등록할 수 있는 중복 카드가 없습니다." : exchangeTab === "sent" ? "보낸 교환 신청이 없습니다." : "받은 교환 신청이 없습니다."}</p>}
    </>}
    {selectedListing && <div className="trade-modal" role="dialog" aria-modal="true" aria-label="교환 신청"><div className="trade-modal__panel"><button className="trade-modal__close" onClick={() => setSelectedListing(null)} aria-label="닫기">×</button><p>TRADE REQUEST</p><h2>카드를 확인하고 교환 신청하세요.</h2><div className="trade-card-pair"><TradeCardPreview label="상대 카드" card={selectedTargetCard} renderCard={renderCard} serial={1701} meta={`${selectedListing.sellerName}님의 카드`} /><i>↔</i><TradeCardPreview label="내 제시 카드" card={selectedOfferCard} renderCard={renderCard} serial={1702} meta={selectedOfferCard ? `보유 ${quantities.get(selectedOfferCard.no)}장` : "아래에서 카드를 선택하세요"} /></div><h3>내가 제시할 카드</h3><div className="trade-offer-list">{listable.map((card, index) => <button key={card.no} className={selectedOffer === card.no ? "is-selected" : ""} onClick={() => setSelectedOffer(card.no)}><div className="trade-offer-list__art">{renderCard(card, index + 1900)}</div><div><b>{displayCardName(card.name)}</b><span>보유 {quantities.get(card.no)}장</span></div></button>)}</div>{!listable.length && <p className="market-empty">교환에 제시할 수 있는 중복 카드가 없습니다.</p>}<button className="trade-modal__submit" disabled={!selectedOffer || pending === `request:${selectedListing.id}`} onClick={() => selectedOffer && void perform("request", selectedListing.id, selectedOffer)}>교환 신청 보내기</button><small>코인은 사용되지 않으며, 수락 전까지 제시 카드는 잠금 상태가 됩니다.</small></div></div>}
    {toast && <div className="showcase-toast" role="status"><b>✦</b><span>{toast}</span></div>}
  </section>;
}

function TradeCardPreview({ label, card, renderCard, serial, meta }: { label: string; card?: CollectionCard; renderCard: Props["renderCard"]; serial: number; meta: string }) { return <div className="trade-card-preview"><span>{label}</span><div className="trade-card-preview__art">{card ? renderCard(card, serial) : <b>?</b>}</div><strong>{card ? displayCardName(card.name) : "카드 선택"}</strong><small>{meta}</small></div>; }
function TradeGrid({ requests, direction, onAction, pending }: { requests: TradeRequest[]; direction: "sent" | "incoming"; onAction: (action: "accept" | "decline" | "cancel-request", id: string) => void; pending: string | null }) { return <div className="trade-grid">{requests.map((request) => <article className="trade-request" key={request.id}><p>{direction === "incoming" ? `${request.requesterName}님이 교환을 신청했습니다.` : "상대방의 수락을 기다리고 있습니다."}</p><div className="trade-request__cards"><TradeArtwork label={direction === "incoming" ? "상대 제시 카드" : "내 제시 카드"} name={request.offeredName} rarity={request.offeredRarity} artworkUrl={request.offeredArtworkUrl} /><em>↔</em><TradeArtwork label={direction === "incoming" ? "내 카드" : "요청 카드"} name={request.requestedName} rarity={request.requestedRarity} artworkUrl={request.requestedArtworkUrl} /></div>{direction === "incoming" ? <footer><button onClick={() => onAction("accept", request.id)} disabled={pending === `accept:${request.id}`}>수락</button><button className="market-card__cancel" onClick={() => onAction("decline", request.id)} disabled={pending === `decline:${request.id}`}>거절</button></footer> : <footer><button className="market-card__cancel" onClick={() => onAction("cancel-request", request.id)} disabled={pending === `cancel-request:${request.id}`}>신청 취소</button></footer>}</article>)}</div>; }
function TradeArtwork({ label, name, rarity, artworkUrl }: { label: string; name: string; rarity: string; artworkUrl: string }) { return <div className="trade-artwork"><span>{label}</span><img src={artworkUrl} alt={`${displayCardName(name)} 카드 일러스트`} /><strong>{displayCardName(name)}</strong><small>{labels[rarity]}</small></div>; }
function CardTile({ card, serial, renderCard, children }: { card: CollectionCard; serial: number; renderCard: Props["renderCard"]; children: ReactNode }) { return <article className="market-card"><div className="market-card__art">{renderCard(card, serial)}</div><div className="market-card__info">{children}</div></article>; }
function MarketGrid({ children }: { children: ReactNode }) { return <div className="market-grid">{children}</div>; }
