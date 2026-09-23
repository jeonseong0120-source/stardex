"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CardBackFace } from "../../components/card-shell";

export type CollectionCard = {
  no: string;
  name: string;
  rarity: string;
  flavor: string;
  scene: string;
  palette: string;
  packId?: "youtube" | "moe";
};

type Props = {
  cards: CollectionCard[];
  owned: Set<string>;
  showcase: (string | null)[];
  onShowcaseChange: (slots: (string | null)[]) => void;
  renderCard: (card: CollectionCard, serial: number) => ReactNode;
};

const rarityLabels: Record<string, string> = {
  COMMON: "C", RARE: "R", "SUPER RARE": "SR", MR: "MR", UR: "UR", BR: "BR",
};
const rarityValues: Record<string, number> = { COMMON: 100, RARE: 300, "SUPER RARE": 1000, MR: 3000, UR: 10000, BR: 30000 };
const cardValue = (card: CollectionCard) => Math.round((rarityValues[card.rarity] || 100) * (0.8 + ((Number(card.no) % 14) / 10)) / 10) * 10;

export function CollectionExperience({ cards, owned, showcase, onShowcaseChange, renderCard }: Props) {
  const [tab, setTab] = useState<"archive" | "showcase">("archive");
  const [series, setSeries] = useState<"youtube" | "moe">("youtube");
  const [rarity, setRarity] = useState("ALL");
  const [status, setStatus] = useState<"ALL" | "OWNED" | "UNDISCOVERED">("ALL");
  const [query, setQuery] = useState("");
  const [progressOpen, setProgressOpen] = useState(false);
  const [selected, setSelected] = useState<CollectionCard | null>(null);
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const addFromGallery = (event: Event) => {
      const cardNo = (event as CustomEvent<string>).detail;
      if (!owned.has(cardNo)) return;
      const card = cards.find((item) => item.no === cardNo);
      if (showcase.includes(cardNo)) {
        setToast(`${card?.name ?? "카드"}는 이미 쇼케이스에 추가되어 있습니다.`);
        window.setTimeout(() => setToast(null), 2600);
        return;
      }
      const vacant = showcase.findIndex((value) => value === null);
      const next = [...showcase];
      next[vacant < 0 ? 0 : vacant] = cardNo;
      onShowcaseChange(next);
      setToast(`${card?.name ?? "카드"}가 쇼케이스에 추가되었습니다.`);
      window.setTimeout(() => setToast(null), 2600);
    };
    window.addEventListener("stardex:add-showcase", addFromGallery);
    return () => window.removeEventListener("stardex:add-showcase", addFromGallery);
  }, [owned, onShowcaseChange, showcase]);

  const seriesCards = useMemo(() => cards.filter((card) => (card.packId ?? "youtube") === series), [cards, series]);
  const visibleCards = useMemo(() => seriesCards.filter((card) => {
    const matchesRarity = rarity === "ALL" || card.rarity === rarity;
    const isOwned = owned.has(card.no);
    const matchesStatus = status === "ALL" || (status === "OWNED" ? isOwned : !isOwned);
    const needle = query.trim().toLowerCase();
    return matchesRarity && matchesStatus && (!needle || card.name.toLowerCase().includes(needle) || card.no.includes(needle));
  }), [seriesCards, owned, query, rarity, status]);

  const updateSlot = (slot: number, cardNo: string | null) => {
    const next = [...showcase];
    next[slot] = cardNo;
    onShowcaseChange(next);
    setPickerSlot(null);
  };
  const addSelected = () => {
    if (!selected || !owned.has(selected.no)) return;
    const vacant = showcase.findIndex((value) => value === null);
    setPickerSlot(vacant < 0 ? 0 : vacant);
  };

  return <section className="collection-experience">
    <div className="collection-switcher" aria-label="컬렉션 보기 선택">
      <p>COLLECTION</p>
      <div><button className={tab === "archive" ? "is-active" : ""} onClick={() => setTab("archive")}>ARCHIVE</button><button className={tab === "showcase" ? "is-active" : ""} onClick={() => setTab("showcase")}>SHOWCASE</button></div>
    </div>
    {tab === "archive" ? <Archive cards={seriesCards} allCards={cards} series={series} onSeriesChange={setSeries} owned={owned} visibleCards={visibleCards} rarity={rarity} setRarity={setRarity} status={status} setStatus={setStatus} query={query} setQuery={setQuery} progressOpen={progressOpen} setProgressOpen={setProgressOpen} renderCard={renderCard} onSelect={setSelected} /> : <Showcase cards={cards} owned={owned} slots={showcase} onPickSlot={setPickerSlot} onRemove={(slot) => updateSlot(slot, null)} renderCard={renderCard} onSelect={setSelected} />}
    {selected && <Detail card={selected} owned={owned.has(selected.no)} onClose={() => setSelected(null)} onAdd={addSelected} renderCard={renderCard} />}
    {pickerSlot !== null && <Picker cards={cards} owned={owned} slot={pickerSlot} onChoose={(cardNo) => { const card = cards.find((item) => item.no === cardNo); if (showcase.includes(cardNo)) { setPickerSlot(null); setToast(`${card?.name ?? "카드"}는 이미 쇼케이스에 추가되어 있습니다.`); window.setTimeout(() => setToast(null), 2600); return; } updateSlot(pickerSlot, cardNo); setToast(`${card?.name ?? "카드"}가 쇼케이스에 추가되었습니다.`); window.setTimeout(() => setToast(null), 2600); }} onClose={() => setPickerSlot(null)} />}
    {toast && <div className="showcase-toast" role="status"><b>✦</b><span>{toast}</span></div>}
  </section>;
}

function Archive({ cards, allCards, series, onSeriesChange, owned, visibleCards, rarity, setRarity, status, setStatus, query, setQuery, progressOpen, setProgressOpen, renderCard, onSelect }: {
  cards: CollectionCard[]; allCards: CollectionCard[]; series: "youtube" | "moe"; onSeriesChange: (value: "youtube" | "moe") => void; owned: Set<string>; visibleCards: CollectionCard[]; rarity: string; setRarity: (value: string) => void; status: "ALL" | "OWNED" | "UNDISCOVERED"; setStatus: (value: "ALL" | "OWNED" | "UNDISCOVERED") => void; query: string; setQuery: (value: string) => void; progressOpen: boolean; setProgressOpen: (value: boolean) => void; renderCard: Props["renderCard"]; onSelect: (card: CollectionCard) => void;
}) {
  const rarities = ["ALL", "COMMON", "RARE", "SUPER RARE", "MR", "UR", "BR"];
  return <>
    <div className="collection-series-tabs" role="tablist" aria-label="카드 팩 시리즈"><button className={series === "youtube" ? "is-active" : ""} onClick={() => onSeriesChange("youtube")}>YOUTUBE</button><button className={series === "moe" ? "is-active" : ""} onClick={() => onSeriesChange("moe")}>MOE MON</button></div><header className="archive-hero"><div><p className="eyebrow">MY ARCHIVE</p><h1>{series === "youtube" ? "YOUTUBE" : "MOE MON"}<br/><i>COLLECTION</i></h1><p className="archive-hero__copy">{series === "youtube" ? "다양한 크리에이터, 다양한 이야기를 수집해보세요." : "새로운 모험과 캐릭터를 카드로 수집해보세요."}</p></div><div className="archive-total"><strong>{cards.filter((card) => owned.has(card.no)).length} <i>/</i> {cards.length}</strong><small>CARDS DISCOVERED</small><b className="collection-total-value"><span>MY COLLECTION · TOTAL VALUE</span>{cards.filter((card) => owned.has(card.no)).reduce((sum, card) => sum + cardValue(card), 0).toLocaleString("ko-KR")}원</b><button onClick={() => setProgressOpen(!progressOpen)}>VIEW PROGRESS <span>→</span></button></div></header>
    {progressOpen && <section className="progress-panel" aria-label="등급별 컬렉션 진행도"><p>COLLECTION PROGRESS</p>{rarities.slice(1).map((item) => { const subset = cards.filter((card) => card.rarity === item); const count = subset.filter((card) => owned.has(card.no)).length; return <div key={item}><span>{rarityLabels[item]}</span><b>{count} / {subset.length}</b><em><i style={{ width: `${subset.length ? count / subset.length * 100 : 0}%` }}/></em></div>})}</section>}
    <div className="archive-controls"><div className="rarity-tabs">{rarities.map((item) => <button key={item} className={rarity === item ? "is-active" : ""} onClick={() => setRarity(item)}>{item === "ALL" ? "ALL" : rarityLabels[item]}</button>)}</div><div className="archive-tools"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="크리에이터 이름으로 검색..." aria-label="크리에이터 검색"/><span>SORT : CARD NO.</span></div><div className="status-tabs">{(["ALL", "OWNED", "UNDISCOVERED"] as const).map((item) => <button key={item} className={status === item ? "is-active" : ""} onClick={() => setStatus(item)}>{item}</button>)}</div></div>
    <div className="archive-grid">{visibleCards.map((card, index) => owned.has(card.no) ? <button className="archive-card collection-card" key={card.no}>{renderCard(card, index + 1)}<small>NO. {card.no}</small><strong className="archive-card__value"><span>ESTIMATED VALUE</span>{cardValue(card).toLocaleString("ko-KR")}원</strong></button> : <article className="archive-locked" key={card.no}><div className="archive-locked__silhouette"><span>?</span></div><small>NO. {card.no}</small></article>)}</div>
  </>;
}

function Showcase({ cards, owned, slots, onPickSlot, onRemove, renderCard, onSelect }: { cards: CollectionCard[]; owned: Set<string>; slots: (string | null)[]; onPickSlot: (slot: number) => void; onRemove: (slot: number) => void; renderCard: Props["renderCard"]; onSelect: (card: CollectionCard) => void }) {
  const displayed = slots.filter(Boolean).length;
  const [editing, setEditing] = useState(false);
  return <section className="showcase-room"><header className="showcase-hero"><div><p className="eyebrow">MY SHOWCASE</p><h1>FAVORITE<br/><i>CARDS.</i></h1><p>나만의 컬렉션을 전시해보세요.</p><blockquote>“<br/>Good Creators<br/>Make a<br/>Brighter World.<br/>”</blockquote></div><div><strong>{String(displayed).padStart(2, "0")} <i>/</i> 09</strong><small>DISPLAYED</small><button className={`showcase-edit ${editing ? "is-active" : ""}`} onClick={() => setEditing(!editing)}>{editing ? "DONE" : "EDIT SHOWCASE"}</button></div></header><div className="showcase-nav"><button aria-label="이전 쇼케이스">‹</button><b>SHOWCASE 01</b><button aria-label="다음 쇼케이스">›</button></div><p className="showcase-divider">MY PRIVATE COLLECTION</p><div className={`showcase-grid ${editing ? "is-editing" : ""}`}>{slots.map((cardNo, slot) => { const card = cards.find((item) => item.no === cardNo); return <article className={`toploader ${card ? "toploader--filled" : ""}`} key={slot}>{card ? <><button className="toploader__card collection-card">{renderCard(card, slot + 1)}<span className="toploader__view">VIEW CARD</span></button><button className="toploader__remove" onClick={() => onRemove(slot)} aria-label={`${card.name} 전시에서 제거`}>{editing ? "REMOVE" : "REMOVE CARD"}</button><footer><b>{String(slot + 1).padStart(2, "0")}</b>{card.name}<small>{rarityLabels[card.rarity]} · NO. {card.no}</small></footer></> : <button className="toploader__add" onClick={() => onPickSlot(slot)}><b>＋</b><span>ADD CARD</span><small>{String(slot + 1).padStart(2, "0")}</small></button>}</article>})}</div></section>;
}

function Detail({ card, owned, onClose, onAdd, renderCard }: { card: CollectionCard; owned: boolean; onClose: () => void; onAdd: () => void; renderCard: Props["renderCard"] }) {
  const [flipped, setFlipped] = useState(false);
  return <div className="collection-modal collection-card-viewer" role="dialog" aria-modal="true" aria-label={`${card.name} 카드 상세`}><button className="collection-modal__backdrop" aria-label="닫기" onClick={onClose}/><section><button className="collection-modal__close" onClick={onClose}>×</button><button className={`collection-detail-flip ${flipped ? "is-flipped" : ""}`} onClick={() => setFlipped((value) => !value)} aria-label="카드 뒤집기"><span className="collection-detail-flip__inner"><span className="collection-detail-flip__face">{renderCard(card, Number(card.no))}</span><span className="collection-detail-flip__face collection-detail-flip__back"><CardBackFace /></span></span></button><p className="collection-detail-hint">TAP CARD TO FLIP</p>{owned && <button className="collection-modal__add collection-viewer-add" onClick={onAdd}>ADD TO SHOWCASE <span>→</span></button>}</section></div>;
}
function Picker({ cards, owned, slot, onChoose, onClose }: { cards: CollectionCard[]; owned: Set<string>; slot: number; onChoose: (cardNo: string) => void; onClose: () => void }) {
  const ownedCards = cards.filter((card) => owned.has(card.no));
  return <div className="showcase-picker" role="dialog" aria-modal="true"><button className="showcase-picker__backdrop" onClick={onClose} aria-label="닫기"/><section><button className="showcase-picker__close" onClick={onClose}>×</button><p className="eyebrow">SELECT A CARD</p><h2>DISPLAY SLOT {String(slot + 1).padStart(2, "0")}</h2>{ownedCards.length ? <div>{ownedCards.map((card) => <button key={card.no} onClick={() => onChoose(card.no)}><span>{rarityLabels[card.rarity]}</span><b>{card.name}</b><small>NO. {card.no}</small></button>)}</div> : <p>아직 전시할 카드가 없어요. 팩을 열어 첫 카드를 획득해보세요.</p>}</section></div>;
}
