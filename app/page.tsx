"use client";
import { useMemo, useState } from "react";

type Rarity = "COMMON" | "RARE" | "SUPER RARE" | "SECRET RARE";
type Card = { no: string; name: string; rarity: Rarity; flavor: string; scene: string; palette: string };

const cards: Card[] = [
  { no:"001",name:"침착맨",rarity:"SECRET RARE",flavor:"방구석 토크",scene:"왕좌와 펜, 무표정의 명언",palette:"royal" },
  { no:"002",name:"랄로",rarity:"SECRET RARE",flavor:"주식과 무지개 무드",scene:"화면 너머, 해탈한 표정",palette:"rainbow" },
  { no:"003",name:"곽튜브",rarity:"SUPER RARE",flavor:"세계 로컬 식사",scene:"낯선 도시의 식탁",palette:"sunset" },
  { no:"004",name:"빠더너스",rarity:"SUPER RARE",flavor:"한국 지리 문쌤",scene:"칠판 앞의 능청스러운 한 컷",palette:"chalk" },
  { no:"005",name:"감스트",rarity:"SUPER RARE",flavor:"축구치킨 광기",scene:"골이 터진 직후의 세레머니",palette:"stadium" },
  { no:"006",name:"피식대학",rarity:"RARE",flavor:"성수동 바이브",scene:"레트로 셔츠와 도시의 밤",palette:"retro" },
  { no:"007",name:"숏박스",rarity:"RARE",flavor:"현실 연애 콩트",scene:"차 안의 아주 현실적인 대화",palette:"drive" },
  { no:"008",name:"지무비",rarity:"RARE",flavor:"결말 포함 영화",scene:"필름과 스크린 사이",palette:"film" },
  { no:"009",name:"말왕",rarity:"COMMON",flavor:"3대 500 괴력",scene:"철과 숨소리만 남은 체육관",palette:"gym" },
  { no:"010",name:"보겸",rarity:"COMMON",flavor:"근황 올림픽",scene:"카메라를 향한 한 번의 인사",palette:"flash" },
  { no:"011",name:"떵개떵",rarity:"COMMON",flavor:"소리 없는 아우성",scene:"가득 찬 식탁의 ASMR",palette:"table" },
  { no:"012",name:"윤가놈",rarity:"COMMON",flavor:"포켓몬 마스터의 기행",scene:"몬스터볼과 이해할 수 없는 가설",palette:"monster" },
];

const shortRarity = (rarity: Rarity) => rarity === "SUPER RARE" ? "SR" : rarity === "SECRET RARE" ? "SS" : rarity[0];
function CardFace({ card, serial, small = false }: { card: Card; serial: number; small?: boolean }) {
  return <article className={`stardex-card ${card.rarity.toLowerCase().replaceAll(" ", "-")} ${small ? "is-small" : ""}`} aria-label={`${card.name} ${card.rarity} 카드`}>
    <div className={`art art-${card.palette}`}><div className="art-grid" /><p className="art-scene">{card.scene}</p><div className="art-orb one" /><div className="art-orb two" /></div>
    <div className="card-top"><span>STX / YT-01</span><span>✦</span></div>
    <div className="card-info"><div><p className="card-name">{card.name}</p><p className="card-flavor">{card.flavor}</p></div><span className="rarity-badge">{shortRarity(card.rarity)}</span><div className="serial">STX-01-{card.no}-{String(serial).padStart(6,"0")}</div></div>
  </article>;
}

export default function Home() {
  const [coin, setCoin] = useState(3000); const [pulls, setPulls] = useState<Card[]>([]); const [active, setActive] = useState(cards[0]); const [view, setView] = useState<"shop" | "collection">("shop");
  const owned = useMemo(() => new Set(pulls.map(card => card.no)), [pulls]);
  const openPack = () => { if (coin < 1000) return; const roll = () => cards[Math.floor(Math.random() * cards.length)]; const next = [roll(),roll(),roll(),roll(),roll()]; setCoin(v => v - 1000); setPulls(v => [...v,...next]); setActive(next[4]); };
  return <main className="app-shell">
    <nav className="topbar"><a className="logo" href="#top">STARDEX</a><div className="nav-links"><button className={view === "shop" ? "active" : ""} onClick={() => setView("shop")}>PACK SHOP</button><button className={view === "collection" ? "active" : ""} onClick={() => setView("collection")}>COLLECTION <em>{owned.size}/12</em></button></div><div className="balance"><span>◇</span>{coin.toLocaleString()} COIN</div></nav>
    {view === "shop" ? <section id="top" className="shop-view"><div className="eyebrow">SEASON 01 · YOUTUBE CREATORS</div><h1>YOU TUBE<br /><i>PACK VOL. 1</i></h1><p className="intro">크리에이터의 장면을 모으세요. 모든 카드는 각자의 시리얼을 가집니다.</p><div className="shop-stage"><div className="pack-box"><div className="pack-shine" /><span>STARDEX</span><strong>YOUTUBE<br />CREATORS</strong><small>VOL. 01 · 5 CARDS</small></div><div className="featured"><CardFace card={active} serial={Math.max(1,pulls.length)} /><p className="featured-caption">LAST REVEAL · <b>{active.name}</b></p></div></div><div className="open-area"><button className="open-button" onClick={openPack} disabled={coin < 1000}>OPEN PACK <span>1,000 ◇</span></button><p>5 CARDS · 마지막 카드는 RARE 이상 보장</p></div>{pulls.length > 0 && <div className="pull-result"><span>NEW PULL</span>{pulls.slice(-5).map((card,index) => <button key={`${card.no}-${index}`} onClick={() => setActive(card)}>{card.name}<b>{shortRarity(card.rarity)}</b></button>)}</div>}</section> : <section className="collection-view"><header><div><p className="eyebrow">MY ARCHIVE</p><h1>YOU TUBE<br /><i>COLLECTION</i></h1></div><p className="progress"><b>{owned.size}</b> / 12<br /><span>CARDS DISCOVERED</span></p></header><div className="collection-grid">{cards.map((card,index) => owned.has(card.no) ? <button key={card.no} className="collection-card" onClick={() => setActive(card)}><CardFace card={card} serial={index+1} small /></button> : <div className="locked-card" key={card.no}><span>?</span><p>NO. {card.no}</p></div>)}</div></section>}
    <footer>STARDEX is a non-commercial fan project. © 2026</footer>
  </main>;
}
