import type { CSSProperties } from "react";

type CardShellProps = { name:string; englishName:string; rarity:string; serial:string; skill:string; flavor:string; artwork?:string; accent:string; palette?:string; compact?:boolean; cardKey?:string };

export function CardBackFace({serial,rarity,accent}:{serial:string;rarity:string;accent:string}){
  return <article className="tcg-card-back" style={{"--accent":accent} as CSSProperties} aria-label={`${rarity} 카드 뒷면`}>
    <div className="tcg-card-back__frame"/><span className="tcg-card-back__serial">{serial}</span><div className="tcg-card-back__mark"><i>△</i><b>STARDEX</b><small>CREATOR COLLECTIBLE</small></div><span className="tcg-card-back__rarity">{rarity}</span>
  </article>;
}

export function CardShell({name,englishName,rarity,serial,skill,flavor,artwork,accent,palette="violet",compact=false,cardKey}:CardShellProps){
  const rarityClass=rarity.toLowerCase().replaceAll(" ","-");
  const isFoil=["SUPER RARE","SECRET RARE","UR","BR","MR"].includes(rarity);
  const rarityLabel:Record<string,string>={"COMMON":"C","RARE":"R","SUPER RARE":"SR","SECRET RARE":"SSR","UR":"UR","BR":"BR","MR":"MR"};
  return <article data-card-key={cardKey} className={`tcg-shell tcg-shell--${palette} tcg-shell--${rarityClass} ${isFoil?"tcg-shell--foil-card":""} ${compact?"tcg-shell--compact":""}`} style={{"--accent":accent} as CSSProperties}>
    <div className="tcg-shell__art">{artwork&&<img src={artwork} alt="" />}</div><div className="tcg-shell__shade"/><div className="tcg-shell__foil"/>
    <header className="tcg-shell__header"><div className="tcg-shell__meta"><span>STARDEX · YT01</span><small>{serial}</small></div><b>{rarityLabel[rarity]||rarity}</b></header>
    <aside className="tcg-shell__rail">CREATOR<br/>COLLECTIBLE<br/>EDITION</aside>
    <section className="tcg-shell__name"><strong>{name}</strong><span>{englishName}</span></section>
    <section className="tcg-shell__skill"><i>✦</i><div><b>{skill}</b><p>{flavor}</p></div></section>
  </article>;
}
