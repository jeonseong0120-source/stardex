import type { CSSProperties } from "react";

type CardShellProps = { name:string; englishName:string; rarity:string; serial:string; skill:string; flavor:string; artwork?:string; accent:string; palette?:string; compact?:boolean };

export function CardShell({name,englishName,rarity,serial,skill,flavor,artwork,accent,palette="violet",compact=false}:CardShellProps){
  const rarityClass=rarity.toLowerCase().replaceAll(" ","-");
  const isFoil=["ART RARE","SUPER RARE","SECRET RARE","UR"].includes(rarity);
  return <article className={`tcg-shell tcg-shell--${palette} tcg-shell--${rarityClass} ${isFoil?"tcg-shell--foil-card":""} ${compact?"tcg-shell--compact":""}`} style={{"--accent":accent} as CSSProperties}>
    <div className="tcg-shell__art">{artwork&&<img src={artwork} alt="" />}</div><div className="tcg-shell__shade"/><div className="tcg-shell__foil"/>
    <header className="tcg-shell__header"><b>{rarity}</b><span>STARDEX · YT01</span><small>{serial}</small></header>
    <aside className="tcg-shell__rail">CREATOR<br/>COLLECTIBLE<br/>EDITION</aside>
    <section className="tcg-shell__name"><strong>{name}</strong><span>{englishName}</span></section>
    <section className="tcg-shell__skill"><i>✦</i><div><b>{skill}</b><p>{flavor}</p></div></section>
  </article>;
}
