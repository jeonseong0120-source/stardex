import type { CSSProperties } from "react";

type CardShellProps = { name:string; englishName:string; rarity:string; serial:string; skill:string; flavor:string; artwork?:string; accent:string; palette?:string; compact?:boolean };

export function CardShell({name,englishName,rarity,serial,skill,flavor,artwork,accent,palette="violet",compact=false}:CardShellProps){
  return <article className={`tcg-shell tcg-shell--${palette} ${compact?"tcg-shell--compact":""}`} style={{"--accent":accent} as CSSProperties}>
    <div className="tcg-shell__art" style={artwork?{backgroundImage:`url(${artwork})`}:undefined}/><div className="tcg-shell__shade"/><div className="tcg-shell__foil"/>
    <header className="tcg-shell__header"><b>{rarity}</b><span>STARDEX · YT01</span><small>{serial}</small></header>
    <aside className="tcg-shell__rail">CREATOR<br/>COLLECTIBLE<br/>EDITION</aside>
    <section className="tcg-shell__name"><strong>{name}</strong><span>{englishName}</span></section>
    <section className="tcg-shell__skill"><i>✦</i><div><b>{skill}</b><p>{flavor}</p></div></section>
    <footer className="tcg-shell__footer">EVERYDAY IS CONTENT <span>{serial}</span></footer>
  </article>;
}
