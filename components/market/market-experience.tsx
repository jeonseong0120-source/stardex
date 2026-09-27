"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { CollectionCard } from "../collection/collection-experience";
import { marketPrice, systemSellPrice } from "../../lib/market";

type Listing = { cardId: string; name: string; rarity: string; artworkUrl: string; price: number; quantity: number };
type MyListing = Omit<Listing, "quantity"> & { id: string; createdAt: string };
type SystemOffer = { id: string; name: string; rarity: string; artworkUrl: string; price: number; packId: "youtube" | "moe" };
type Props = { cards: CollectionCard[]; quantities: Map<string, number>; coin: number; renderCard: (card: CollectionCard, serial: number) => ReactNode; onCollectionRefresh: () => Promise<void> };
const labels: Record<string, string> = { COMMON: "C", RARE: "R", "SUPER RARE": "SR", MR: "MR", UR: "UR", BR: "BR" };

export function MarketExperience({ cards, quantities, coin, renderCard, onCollectionRefresh }: Props) {
  const [section, setSection] = useState<"store" | "exchange">("store");
  const [exchangeTab, setExchangeTab] = useState<"buy" | "list" | "mine">("buy");
  const [series, setSeries] = useState<"youtube" | "moe">("youtube");
  const [listings, setListings] = useState<Listing[]>([]), [myListings, setMyListings] = useState<MyListing[]>([]), [offers, setOffers] = useState<{ date: string; youtube: SystemOffer[]; moe: SystemOffer[] }>({ date: "", youtube: [], moe: [] });
  const [rarity, setRarity] = useState("ALL"), [query, setQuery] = useState(""), [pending, setPending] = useState<string | null>(null), [notice, setNotice] = useState<string | null>(null), [loaded, setLoaded] = useState(false);
  const refreshMarket = async () => { const response = await fetch("/api/marketplace"); if (!response.ok) { setNotice("거래소를 불러오지 못했습니다. 로그인 상태를 확인해주세요."); return; } const data = await response.json() as { listings: Listing[]; myListings: MyListing[]; systemOffers: typeof offers }; setListings(data.listings); setMyListings(data.myListings); setOffers(data.systemOffers); setLoaded(true); };
  useEffect(() => { void refreshMarket(); const retry = window.setTimeout(() => void refreshMarket(), 900); return () => window.clearTimeout(retry); }, []);
  const listedByCard = useMemo(() => myListings.reduce((map, item) => map.set(item.cardId, (map.get(item.cardId) ?? 0) + 1), new Map<string, number>()), [myListings]);
  const matches = <T extends { name: string; rarity: string }>(items: T[]) => items.filter((item) => (rarity === "ALL" || item.rarity === rarity) && (!query.trim() || item.name.toLowerCase().includes(query.trim().toLowerCase())));
  const duplicates = useMemo(() => cards.filter((card) => (quantities.get(card.no) ?? 0) > 1), [cards, quantities]);
  const listable = useMemo(() => duplicates.filter((card) => (quantities.get(card.no) ?? 0) - (listedByCard.get(card.no) ?? 0) > 1), [duplicates, listedByCard, quantities]);
  const perform = async (action: "list" | "cancel" | "buy" | "system-buy" | "system-sell", key: string) => {
    setPending(`${action}:${key}`); setNotice(null);
    try {
      const body = action === "cancel" ? { action, listingId: key } : { action, cardId: key };
      const response = await fetch("/api/marketplace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json() as { error?: string };
      if (!response.ok) { setNotice(data.error ?? "거래를 완료하지 못했습니다."); return; }
      await Promise.all([refreshMarket(), onCollectionRefresh()]);
      setNotice(action === "system-buy" ? "오늘의 카드 구매 완료. 컬렉션에 추가되었습니다." : action === "system-sell" ? "시스템 매입이 완료되었습니다. 코인을 받았습니다." : action === "list" ? "교환 매물로 등록했습니다." : action === "buy" ? "교환이 완료되었습니다. 컬렉션에 카드가 추가되었습니다." : "교환 등록을 취소했습니다.");
    } catch { setNotice("네트워크 문제로 거래를 완료하지 못했습니다."); } finally { setPending(null); }
  };
  const rarities = ["ALL", "RARE", "SUPER RARE", "MR", "UR", "BR"], cardOf = (id: string) => cards.find((card) => card.no === id);
  const currentOffers = offers[series];

  return <section className="market-experience">
    <header className="market-hero"><div><p className="market-hero__eyebrow">거래소</p><h1>EXCHANGE</h1><p>{section === "store" ? "오늘의 카드와 중복 카드 즉시 매입을 이용하세요." : "유저끼리 고정 시세로 안전하게 카드를 교환합니다."}</p></div><aside><span>내 보유 코인</span><strong>◇ {coin.toLocaleString()}</strong><small>유저 교환 수수료 0%</small></aside></header>
    <div className="market-mode-tabs" role="tablist" aria-label="거래소 구분"><button className={section === "store" ? "is-active" : ""} onClick={() => setSection("store")}>판매 <small>SYSTEM SHOP</small></button><button className={section === "exchange" ? "is-active" : ""} onClick={() => setSection("exchange")}>교환 <small>PLAYER EXCHANGE</small></button></div>
    {section === "store" ? <>
      <div className="system-heading"><div><span>DAILY SELECTION · {offers.date || "LOADING"}</span><h2>오늘의 판매 카드</h2><p>매일 자정(KST), 각 시리즈별 다섯 장이 새롭게 공개됩니다.</p></div><div className="system-series-tabs"><button className={series === "youtube" ? "is-active" : ""} onClick={() => setSeries("youtube")}>크리에이터 팩</button><button className={series === "moe" ? "is-active" : ""} onClick={() => setSeries("moe")}>모에몬 팩</button></div></div>
      <div className="market-toolbar"><div>{rarities.map((item) => <button key={item} className={rarity === item ? "is-active" : ""} onClick={() => setRarity(item)}>{item === "ALL" ? "전체" : labels[item]}</button>)}</div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="카드 이름 검색" aria-label="카드 이름 검색"/></div>
      {notice && <p className="market-notice" role="status">{notice}</p>}
      {!loaded ? <p className="market-empty">오늘의 카드를 준비하고 있습니다.</p> : <MarketGrid>{matches(currentOffers).map((offer, index) => { const card = cardOf(offer.id); return card && <CardTile key={offer.id} card={card} serial={index + 1300} renderCard={renderCard}><strong>{offer.name}</strong><b>◇ {offer.price.toLocaleString()}</b><span>{labels[offer.rarity]} · 시스템 판매</span><button disabled={coin < offer.price || pending === `system-buy:${offer.id}`} onClick={() => void perform("system-buy", offer.id)}>구매하기</button></CardTile>; })}</MarketGrid>}
      {loaded && !matches(currentOffers).length && <p className="market-empty">조건에 맞는 오늘의 카드가 없습니다.</p>}
      <section className="system-buyback"><div><span>SYSTEM BUYBACK</span><h2>중복 카드 즉시 매입</h2><p>도감 보관용 마지막 한 장은 남기고, 중복 카드만 즉시 코인으로 바꿀 수 있습니다.</p></div><small>매입가 · 기준 시세의 60%</small></section>
      <MarketGrid>{matches(duplicates).map((card, index) => { const held = quantities.get(card.no) ?? 0, sellable = held - 1, price = systemSellPrice(card.no, card.rarity); return <CardTile key={card.no} card={card} serial={index + 1500} renderCard={renderCard}><strong>{card.name}</strong><b>◇ {price.toLocaleString()}</b><span>{labels[card.rarity]} · 보유 {held}장 · 즉시 판매 {sellable}장</span><button disabled={pending === `system-sell:${card.no}`} onClick={() => void perform("system-sell", card.no)}>즉시 판매</button></CardTile>; })}</MarketGrid>
      {loaded && !matches(duplicates).length && <p className="market-empty">즉시 판매할 중복 카드가 없습니다.</p>}
    </> : <>
      <div className="market-tabs" role="tablist" aria-label="유저 교환 메뉴"><button className={exchangeTab === "buy" ? "is-active" : ""} onClick={() => setExchangeTab("buy")}>구매하기 <i>{listings.reduce((sum, item) => sum + item.quantity, 0)}</i></button><button className={exchangeTab === "list" ? "is-active" : ""} onClick={() => setExchangeTab("list")}>카드 등록</button><button className={exchangeTab === "mine" ? "is-active" : ""} onClick={() => setExchangeTab("mine")}>내 교환 목록 <i>{myListings.length}</i></button></div>
      <div className="market-toolbar"><div>{rarities.map((item) => <button key={item} className={rarity === item ? "is-active" : ""} onClick={() => setRarity(item)}>{item === "ALL" ? "전체" : labels[item]}</button>)}</div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="카드 이름 검색" aria-label="카드 이름 검색"/></div>
      {notice && <p className="market-notice" role="status">{notice}</p>}
      {!loaded ? <p className="market-empty">교환소를 준비하고 있습니다.</p> : exchangeTab === "buy" ? <MarketGrid>{matches(listings).map((listing, index) => { const card = cardOf(listing.cardId); return card && <CardTile key={listing.cardId} card={card} serial={index + 700} renderCard={renderCard}><strong>{listing.name}</strong><b>◇ {listing.price.toLocaleString()}</b><span>{labels[listing.rarity]} · 교환 가능 {listing.quantity}장</span><button disabled={coin < listing.price || pending === `buy:${listing.cardId}`} onClick={() => void perform("buy", listing.cardId)}>교환하기</button></CardTile>; })}</MarketGrid> : exchangeTab === "list" ? <MarketGrid>{matches(listable).map((card, index) => { const held = quantities.get(card.no) ?? 0, listed = listedByCard.get(card.no) ?? 0, available = held - listed - 1; return <CardTile key={card.no} card={card} serial={index + 900} renderCard={renderCard}><strong>{card.name}</strong><b>◇ {marketPrice(card.no, card.rarity).toLocaleString()}</b><span>{labels[card.rarity]} · 보유 {held}장 · 등록 가능 {available}장</span><small>도감 보관용 마지막 1장 보호</small><button disabled={pending === `list:${card.no}`} onClick={() => void perform("list", card.no)}>교환 등록</button></CardTile>; })}</MarketGrid> : <MarketGrid>{matches(myListings).map((listing, index) => { const card = cardOf(listing.cardId); return card && <CardTile key={listing.id} card={card} serial={index + 1100} renderCard={renderCard}><strong>{listing.name}</strong><b>◇ {listing.price.toLocaleString()}</b><span>{labels[listing.rarity]} · 교환 등록 중</span><button className="market-card__cancel" disabled={pending === `cancel:${listing.id}`} onClick={() => void perform("cancel", listing.id)}>등록 취소</button></CardTile>; })}</MarketGrid>}
      {loaded && ((exchangeTab === "buy" && !matches(listings).length) || (exchangeTab === "list" && !matches(listable).length) || (exchangeTab === "mine" && !matches(myListings).length)) && <p className="market-empty">{exchangeTab === "buy" ? "현재 교환 가능한 카드가 없습니다." : exchangeTab === "list" ? "등록할 수 있는 중복 카드가 없습니다." : "등록한 교환 카드가 없습니다."}</p>}
    </>}
  </section>;
}

function CardTile({ card, serial, renderCard, children }: { card: CollectionCard; serial: number; renderCard: Props["renderCard"]; children: ReactNode }) { return <article className="market-card"><div className="market-card__art">{renderCard(card, serial)}</div><div className="market-card__info">{children}</div></article>; }
function MarketGrid({ children }: { children: ReactNode }) { return <div className="market-grid">{children}</div>; }
