import type { CSSProperties } from "react";

type CardShellProps = { name:string; englishName:string; rarity:string; serial:string; skill:string; flavor:string; artwork?:string; accent:string; palette?:string; compact?:boolean; cardKey?:string };

export function CardBackFace(){
  return <article className="tcg-card-back tcg-card-back--archive" aria-label="STARDEX 카드 뒷면">
    <span className="tcg-card-back__frame"/><span className="tcg-card-back__orbit"/><span className="tcg-card-back__star" aria-hidden="true"/><div className="tcg-card-back__mark"><b>STARDEX</b><small>크리에이터 카드 컬렉션</small></div><span className="tcg-card-back__edition">카드 그 이상, 하나의 문화.</span>
  </article>;
}

export function CardShell({name,englishName,rarity,serial,skill,flavor,artwork,accent,palette="violet",compact=false,cardKey}:CardShellProps){
  const rarityClass=rarity.toLowerCase().replaceAll(" ","-");
  const isFoil=["SUPER RARE","SECRET RARE","UR","BR","MR"].includes(rarity);
  const rarityLabel:Record<string,string>={"COMMON":"C","RARE":"R","SUPER RARE":"SR","SECRET RARE":"SSR","UR":"UR","BR":"BR","MR":"MR"};
  return <article data-card-key={cardKey} className={`tcg-shell tcg-shell--${palette} tcg-shell--${rarityClass} ${isFoil?"tcg-shell--foil-card":""} ${compact?"tcg-shell--compact":""}`} style={{"--accent":accent} as CSSProperties}>
    <div className="tcg-shell__art">{artwork&&<img src={artwork} alt="" />}</div><div className="tcg-shell__shade"/><div className="tcg-shell__foil"/>
    <header className="tcg-shell__header"><div className="tcg-shell__meta"><span>STARDEX · YT01</span><small>{serial}</small></div><b>{rarityLabel[rarity]||rarity}</b></header>
    <aside className="tcg-shell__rail">크리에이터<br/>컬렉터블<br/>에디션</aside>
    <section className="tcg-shell__name"><strong>{name}</strong><span>{englishName}</span></section>
    <section className="tcg-shell__skill"><i>✦</i><div><b>{skill}</b><p>{flavor}</p></div></section>
  </article>;
}
