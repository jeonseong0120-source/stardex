"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { CollectionCard } from "../collection/collection-experience";
import { marketPrice } from "../../lib/market";

type Listing = { cardId: string; name: string; rarity: string; artworkUrl: string; price: number; quantity: number };
type MyListing = Omit<Listing, "quantity"> & { id: string; createdAt: string };
type Props = { cards: CollectionCard[]; quantities: Map<string, number>; coin: number; renderCard: (card: CollectionCard, serial: number) => ReactNode; onCollectionRefresh: () => Promise<void> };

const labels: Record<string, string> = { COMMON: "C", RARE: "R", "SUPER RARE": "SR", MR: "MR", UR: "UR", BR: "BR" };

export function MarketExperience({ cards, quantities, coin, renderCard, onCollectionRefresh }: Props) {
  const [tab, setTab] = useState<"buy" | "sell" | "mine">("buy");
  const [listings, setListings] = useState<Listing[]>([]);
  const [myListings, setMyListings] = useState<MyListing[]>([]);
  const [rarity, setRarity] = useState("ALL");
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const refreshMarket = async () => {
    const response = await fetch("/api/marketplace");
    if (!response.ok) { setNotice("거래소를 불러오지 못했습니다. 로그인 상태를 확인해주세요."); return; }
    const data = await response.json() as { listings: Listing[]; myListings: MyListing[] };
    setListings(data.listings); setMyListings(data.myListings); setLoaded(true);
  };
  useEffect(() => { void refreshMarket(); }, []);
  const listedByCard = useMemo(() => myListings.reduce((map, item) => map.set(item.cardId, (map.get(item.cardId) ?? 0) + 1), new Map<string, number>()), [myListings]);
  const matches = <T extends { name: string; rarity: string }>(items: T[]) => items.filter((item) => (rarity === "ALL" || item.rarity === rarity) && (!query.trim() || item.name.toLowerCase().includes(query.trim().toLowerCase())));
  const sellable = useMemo(() => cards.filter((card) => {
    const held = quantities.get(card.no) ?? 0;
    return held - (listedByCard.get(card.no) ?? 0) > 1;
  }), [cards, listedByCard, quantities]);
  const perform = async (action: "list" | "cancel" | "buy", key: string) => {
    setPending(`${action}:${key}`); setNotice(null);
    try {
      const response = await fetch("/api/marketplace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action === "cancel" ? { action, listingId: key } : { action, cardId: key }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) { setNotice(data.error ?? "거래를 완료하지 못했습니다."); return; }
      await Promise.all([refreshMarket(), onCollectionRefresh()]);
      setNotice(action === "list" ? "거래소에 등록했습니다." : action === "buy" ? "구매 완료. 컬렉션에 카드가 추가되었습니다." : "판매 등록을 취소했습니다.");
    } catch { setNotice("네트워크 문제로 거래를 완료하지 못했습니다."); }
    finally { setPending(null); }
  };
  const rarities = ["ALL", "RARE", "SUPER RARE", "MR", "UR", "BR"];
  const cardOf = (id: string) => cards.find((card) => card.no === id);

  return <section className="market-experience">
    <header className="market-hero"><div><h1>EXCHANGE</h1><p>중복 카드는 고정 시세로 거래합니다. 도감 보관용 마지막 한 장은 항상 보호됩니다.</p></div><aside><span>내 보유 코인</span><strong>◇ {coin.toLocaleString()}</strong><small>거래 수수료 0%</small></aside></header>
    <div className="market-tabs" role="tablist" aria-label="거래소 메뉴"><button className={tab === "buy" ? "is-active" : ""} onClick={() => setTab("buy")}>구매하기 <i>{listings.reduce((sum, item) => sum + item.quantity, 0)}</i></button><button className={tab === "sell" ? "is-active" : ""} onClick={() => setTab("sell")}>판매하기</button><button className={tab === "mine" ? "is-active" : ""} onClick={() => setTab("mine")}>내 판매 목록 <i>{myListings.length}</i></button></div>
    <div className="market-toolbar"><div>{rarities.map((item) => <button key={item} className={rarity === item ? "is-active" : ""} onClick={() => setRarity(item)}>{item === "ALL" ? "전체" : labels[item]}</button>)}</div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="카드 이름 검색" aria-label="카드 이름 검색"/></div>
    {notice && <p className="market-notice" role="status">{notice}</p>}
    {!loaded ? <p className="market-empty">거래소를 준비하고 있습니다.</p> : tab === "buy" ? <MarketGrid>{matches(listings).map((listing, index) => { const card = cardOf(listing.cardId); return card && <article className="market-card" key={listing.cardId}><div className="market-card__art">{renderCard(card, index + 700)}</div><div className="market-card__info"><strong>{listing.name}</strong><b>◇ {listing.price.toLocaleString()}</b><span>{labels[listing.rarity]} · 판매 중 {listing.quantity}장</span><button disabled={coin < listing.price || pending === `buy:${listing.cardId}`} onClick={() => void perform("buy", listing.cardId)}>구매하기</button></div></article>;})}</MarketGrid> : tab === "sell" ? <MarketGrid>{matches(sellable).map((card, index) => { const held = quantities.get(card.no) ?? 0; const listed = listedByCard.get(card.no) ?? 0; const available = held - listed - 1; return <article className="market-card" key={card.no}><div className="market-card__art">{renderCard(card, index + 900)}</div><div className="market-card__info"><strong>{card.name}</strong><b>◇ {marketPrice(card.no, card.rarity).toLocaleString()}</b><span>{labels[card.rarity]} · 보유 {held}장 · 판매 가능 {available}장</span><small>도감 보관용 마지막 1장 보호</small><button disabled={pending === `list:${card.no}`} onClick={() => void perform("list", card.no)}>1장 등록</button></div></article>;})}</MarketGrid> : <MarketGrid>{matches(myListings).map((listing, index) => { const card = cardOf(listing.cardId); return card && <article className="market-card" key={listing.id}><div className="market-card__art">{renderCard(card, index + 1100)}</div><div className="market-card__info"><strong>{listing.name}</strong><b>◇ {listing.price.toLocaleString()}</b><span>{labels[listing.rarity]} · 거래소 판매 중</span><button className="market-card__cancel" disabled={pending === `cancel:${listing.id}`} onClick={() => void perform("cancel", listing.id)}>등록 취소</button></div></article>;})}</MarketGrid>}
    {loaded && ((tab === "buy" && !matches(listings).length) || (tab === "sell" && !matches(sellable).length) || (tab === "mine" && !matches(myListings).length)) && <p className="market-empty">{tab === "buy" ? "현재 거래 가능한 카드가 없습니다." : tab === "sell" ? "판매할 수 있는 중복 카드가 없습니다." : "등록한 판매 카드가 없습니다."}</p>}
  </section>;
}

function MarketGrid({ children }: { children: ReactNode }) { return <div className="market-grid">{children}</div>; }
