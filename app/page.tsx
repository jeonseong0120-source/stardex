"use client";
import "./opening.css";
import "./pack-rarity-effects.css";
import "./booster-product.css";
import "./pack.css";
import "./depth.css";
import "./stack.css";
import "./reveal-flow.css";
import "./final-cards.css";
import "./raw-art.css";
import "./card-cleanup.css";
import "./card-system.css";
import "./tcg-shell.css";
import "./layout-fixes.css";
import "./card-scale.css";
import "./br-card.css";
import "./lobby.css";
import "./experience-tuning.css";
import "./luxury-tcg.css";
import "./card-back.css";
import "./opening-stage.css";
import "./landing-hero.css";
import "./reveal-modal.css";
import "./collection-experience.css";
import { CardBackFace, CardShell } from "../components/card-shell";
import { CollectionExperience } from "../components/collection/collection-experience";
import { PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { getPack, type PackId, type PackRarity } from "../components/packs/pack-catalog";
import { MOE_CARDS } from "../components/packs/moe-cards";
import { AuthWidget } from "../components/auth/auth-widget";

type Rarity = PackRarity;
type Card = { no:string; name:string; rarity:Rarity; flavor:string; scene:string; palette:string; packId?:PackId };
type Opening = "shop" | "box" | "tear" | "deal" | "result";
const cards:Card[]=[
  {no:"001",name:"침착맨",rarity:"BR",flavor:"방구석 토크",scene:"왕좌와 펜, 무표정의 명언",palette:"royal"},{no:"002",name:"랄로",rarity:"SUPER RARE",flavor:"주식과 무지개 무드",scene:"화면 너머, 해탈한 표정",palette:"rainbow"},{no:"003",name:"곽튜브",rarity:"RARE",flavor:"세계 로컬 식사",scene:"낯선 도시의 식탁",palette:"sunset"},{no:"004",name:"빠더너스",rarity:"SUPER RARE",flavor:"한국 지리 문쌤",scene:"칠판 앞의 능청스러운 한 컷",palette:"chalk"},{no:"005",name:"감스트",rarity:"SUPER RARE",flavor:"축구치킨 광기",scene:"골이 터진 직후의 세레머니",palette:"stadium"},{no:"006",name:"피식대학",rarity:"RARE",flavor:"성수동 바이브",scene:"레트로 셔츠와 도시의 밤",palette:"retro"},{no:"007",name:"숏박스",rarity:"SUPER RARE",flavor:"현실 연애 콩트",scene:"차 안의 아주 현실적인 대화",palette:"drive"},{no:"008",name:"지무비",rarity:"UR",flavor:"결말 포함 영화",scene:"필름과 스크린 사이",palette:"film"},{no:"009",name:"말왕",rarity:"SUPER RARE",flavor:"3대 500 괴력",scene:"철과 숨소리만 남은 체육관",palette:"gym"},{no:"010",name:"보겸",rarity:"RARE",flavor:"근황 올림픽",scene:"카메라를 향한 한 번의 인사",palette:"flash"},{no:"011",name:"떵개떵",rarity:"RARE",flavor:"소리 없는 아우성",scene:"가득 찬 식탁의 ASMR",palette:"table"},{no:"012",name:"윤가놈",rarity:"SUPER RARE",flavor:"포켓몬 마스터의 기행",scene:"몬스터볼과 이해할 수 없는 가설",palette:"monster"}
];
cards.push(
  {no:"013",name:"주둥이방송 C",rarity:"COMMON",flavor:"방송의 시작",scene:"가장 담백한 한 장면",palette:"chalk"},
  {no:"014",name:"랄로 C",rarity:"COMMON",flavor:"방구석 시세",scene:"조용히 흐름을 읽는다",palette:"rainbow"},
  {no:"015",name:"침착맨 C",rarity:"COMMON",flavor:"일상 토크",scene:"오늘도 콘텐츠",palette:"royal"},
  {no:"016",name:"보겸 C",rarity:"COMMON",flavor:"근황 한마디",scene:"카메라 앞의 인사",palette:"flash"},
  {no:"017",name:"감스트 C",rarity:"COMMON",flavor:"축구 토크",scene:"경기 전의 한 컷",palette:"stadium"},
  {no:"018",name:"숏박스 C",rarity:"COMMON",flavor:"현실 한 장면",scene:"일상 속의 콩트",palette:"drive"}
);
cards.push({no:"019",name:"미미미누 C",rarity:"COMMON",flavor:"공부 콘텐츠",scene:"담백한 응원의 한마디",palette:"chalk"},{no:"020",name:"쯔앙 C",rarity:"COMMON",flavor:"밝은 한 끼",scene:"오늘도 맛있는 순간",palette:"table"},{no:"021",name:"곽튜브 C",rarity:"COMMON",flavor:"여행의 시작",scene:"낯선 곳으로 떠난다",palette:"sunset"});
cards.push(
  {no:"022",name:"김규남",rarity:"RARE",flavor:"구름 위의 토끼",scene:"포근한 하늘에서 건네는 인사",palette:"sky"},
  {no:"023",name:"김계란",rarity:"SUPER RARE",flavor:"붉은 달의 수련",scene:"핏빛 달 아래에서 단련한다",palette:"crimson"},
  {no:"024",name:"엄지윤",rarity:"SUPER RARE",flavor:"블루문 서포터",scene:"경기장의 함성과 함께 달린다",palette:"stadium"},
  {no:"025",name:"슈기",rarity:"RARE",flavor:"치킨 테이블",scene:"가장 맛있는 한 입을 고른다",palette:"table"},
  {no:"026",name:"룩삼",rarity:"RARE",flavor:"심야 스트리밍",scene:"화면 너머의 순간을 함께 웃는다",palette:"night"},
  {no:"027",name:"유후",rarity:"RARE",flavor:"창가의 멜로디",scene:"햇살과 함께 다음 곡을 기다린다",palette:"sunset"},
  {no:"028",name:"유후(각성)",rarity:"SUPER RARE",flavor:"각성의 협주곡",scene:"무대 위 모든 음을 깨운다",palette:"arcane"},
  {no:"029",name:"주우재",rarity:"RARE",flavor:"미니멀 룩",scene:"가장 담백한 실루엣을 완성한다",palette:"mono"},
  {no:"030",name:"카더가든",rarity:"MR",flavor:"보랏빛 마도서",scene:"별과 이야기 사이에서 노래를 꺼낸다",palette:"mythic"},
  {no:"031",name:"장삐쭈",rarity:"SUPER RARE",flavor:"컷의 지배자",scene:"수많은 장면 속에서 이야기를 완성한다",palette:"ink"},
  {no:"032",name:"혜안",rarity:"SUPER RARE",flavor:"노을의 경계",scene:"황혼의 전장에서도 시선을 놓지 않는다",palette:"ember"},
  {no:"033",name:"궤도",rarity:"SUPER RARE",flavor:"우주의 강의",scene:"별과 공식 사이로 답을 이끈다",palette:"cosmos"},
  {no:"034",name:"고재영",rarity:"RARE",flavor:"정상에서의 인사",scene:"구름 위에서 다음 길을 바라본다",palette:"summit"},
  {no:"035",name:"우정잉",rarity:"SUPER RARE",flavor:"바리스타의 마법",scene:"한 잔의 커피로 공기를 바꾼다",palette:"coffee"},
  {no:"036",name:"괴물쥐",rarity:"SUPER RARE",flavor:"역전의 한타",scene:"결정적 순간을 화면 너머로 끌어온다",palette:"arena"},
  {no:"037",name:"괴물쥐(연패)",rarity:"MR",flavor:"녹빛 연패",scene:"끝없는 패배의 밤도 결국 이야기로 남긴다",palette:"verdant"},
  {no:"038",name:"풍자",rarity:"RARE",flavor:"야식의 여왕",scene:"뜨거운 한 점과 함께 밤을 지배한다",palette:"neon"},
  {no:"039",name:"붉은머리 랄로",rarity:"MR",flavor:"조커의 패",scene:"붉은 기운으로 판을 뒤집는다",palette:"crimson"},
  {no:"040",name:"핫소스",rarity:"RARE",flavor:"옐로 파티",scene:"장난기 가득한 순간을 함께 쏜다",palette:"sunny"},
  {no:"041",name:"임우일",rarity:"SUPER RARE",flavor:"골목의 사나이",scene:"낯선 골목에서도 자기 리듬을 지킨다",palette:"alley"},
  {no:"042",name:"흑자헬스",rarity:"SUPER RARE",flavor:"철의 호흡",scene:"땀과 무게로 자신을 증명한다",palette:"iron"},
  {no:"043",name:"말왕",rarity:"MR",flavor:"블록의 왕",scene:"픽셀 세계에서도 가장 큰 한 방을 든다",palette:"pixel"},
  {no:"044",name:"미미미누",rarity:"RARE",flavor:"새벽의 공부",scene:"고요한 새벽에도 답을 찾는다",palette:"study"},
  {no:"045",name:"미미미누",rarity:"SUPER RARE",flavor:"붉은 망토",scene:"자신만의 깃발 아래 앞으로 나아간다",palette:"royal"},
  {no:"046",name:"흑자헬스",rarity:"RARE",flavor:"장인의 손",scene:"나무와 땀으로 다음 한계를 만든다",palette:"workshop"},
  {no:"047",name:"픽고에겐남",rarity:"RARE",flavor:"햇살의 미소",scene:"밝은 한마디로 하루를 채운다",palette:"sunrise"},
  {no:"048",name:"조진세",rarity:"RARE",flavor:"생활관의 예술",scene:"평범한 하루도 자기 방식으로 버틴다",palette:"barracks"},
  {no:"049",name:"김원훈",rarity:"RARE",flavor:"옥상의 한숨",scene:"도시의 노을 아래 다음 장면을 기다린다",palette:"rooftop"},
  {no:"050",name:"우주하마",rarity:"MR",flavor:"은하의 여행자",scene:"별과 소행성 사이를 유영한다",palette:"cosmos"},
  {no:"051",name:"너덜트",rarity:"SUPER RARE",flavor:"사건의 기록",scene:"세 명의 시선으로 다음 장면을 추적한다",palette:"noir"},
  {no:"052",name:"밴쯔",rarity:"SUPER RARE",flavor:"미식의 일격",scene:"온 세상의 식재료를 한 팬에 담는다",palette:"feast"},
  {no:"053",name:"승우아빠",rarity:"SUPER RARE",flavor:"불꽃의 주방",scene:"강한 불맛으로 오늘의 한 접시를 완성한다",palette:"flame"},
  {no:"054",name:"김풍",rarity:"COMMON",flavor:"주방의 철학",scene:"한 접시 위에 자기 이야기를 담는다",palette:"kitchen"},
  {no:"055",name:"주호민",rarity:"BR",flavor:"먹빛의 붓",scene:"검은 먹빛으로 자신의 세계를 그린다",palette:"ink"},
  {no:"056",name:"곽범",rarity:"COMMON",flavor:"데님 한 장",scene:"가볍게 웃으며 오늘의 장면을 만든다",palette:"denim"},
  {no:"057",name:"유영우",rarity:"COMMON",flavor:"장난스러운 신사",scene:"한 번의 표정으로 장면을 뒤집는다",palette:"midnight"},
  {no:"058",name:"주우재",rarity:"COMMON",flavor:"공부의 밤",scene:"책과 함께 조용히 다음 날을 준비한다",palette:"study"},
  {no:"059",name:"우정잉",rarity:"COMMON",flavor:"파란 하루",scene:"밝은 미소로 오늘의 공기를 채운다",palette:"blue"},
  {no:"060",name:"쯔양",rarity:"UR",flavor:"천상의 만찬",scene:"끝없는 식탁 위에서 행복한 한 입을 즐긴다",palette:"feast"}
);
cards.push(
  {no:"061",name:"파뿌리",rarity:"COMMON",flavor:"웃음의 한 판",scene:"게임과 웃음이 가득한 거실",palette:"retro"},
  {no:"062",name:"디바제시카",rarity:"RARE",flavor:"미스터리 서재",scene:"어둠 속 단서를 읽어낸다",palette:"ink"},
  {no:"063",name:"빠니보틀",rarity:"RARE",flavor:"낯선 여정",scene:"여행의 시작을 가볍게 손짓한다",palette:"sky"},
  {no:"064",name:"파카",rarity:"RARE",flavor:"노을의 도약",scene:"해 질 녘 다음 모험을 바라본다",palette:"sunset"},
  {no:"065",name:"저라뎃",rarity:"RARE",flavor:"심야의 한 판",scene:"방 안의 화면에서 승부를 시작한다",palette:"night"},
  {no:"066",name:"이선민",rarity:"MR",flavor:"설원의 군주",scene:"눈보라 속에서도 여유를 잃지 않는다",palette:"mythic"},
  {no:"067",name:"철면수심",rarity:"COMMON",flavor:"붉은 응원",scene:"한 번의 엄지로 분위기를 뒤집는다",palette:"crimson"},
  {no:"068",name:"김민수",rarity:"COMMON",flavor:"검은 리듬",scene:"자신만의 박자로 순간을 만든다",palette:"mono"},
  {no:"069",name:"최준",rarity:"COMMON",flavor:"한 줄의 아이디어",scene:"일상의 표정에서 다음 장면을 찾는다",palette:"chalk"},
  {no:"070",name:"우왁굳",rarity:"COMMON",flavor:"픽셀의 세계",scene:"가상과 현실 사이의 이야기를 만든다",palette:"pixel"},
  {no:"071",name:"킹기훈",rarity:"COMMON",flavor:"킹의 밤",scene:"방송의 중심에서 모두를 맞이한다",palette:"arena"},
  {no:"072",name:"다인이공",rarity:"RARE",flavor:"밤의 테이블",scene:"잔잔한 한 잔으로 이야기를 시작한다",palette:"coffee"},
  {no:"073",name:"턱형",rarity:"COMMON",flavor:"무대의 여유",scene:"한 장면을 자기 리듬으로 완성한다",palette:"mono"},
  {no:"074",name:"윽박",rarity:"COMMON",flavor:"보컬 부스",scene:"마이크 앞에서 가장 단단한 소리를 낸다",palette:"iron"},
  {no:"075",name:"임다",rarity:"COMMON",flavor:"콧수염 머그",scene:"가벼운 한 잔으로 오늘을 연다",palette:"chalk"},
  {no:"076",name:"양띵",rarity:"COMMON",flavor:"블록의 모험",scene:"픽셀 세계에 새로운 이야기를 짓는다",palette:"pixel"}
);
cards.push(
  {no:"077",name:"뽀구미",rarity:"SUPER RARE",flavor:"노란 방의 손짓",scene:"가득한 응원 속에서 화면 너머로 손을 뻗는다",palette:"sunny"},
  {no:"078",name:"윤가놈 C",rarity:"COMMON",flavor:"반전의 엄지",scene:"한 번의 표정으로 분위기를 바꾼다",palette:"mono"},
  {no:"079",name:"쿠빈",rarity:"SUPER RARE",flavor:"보랏빛 라이브",scene:"심야의 조명 아래 자신만의 리듬을 만든다",palette:"neon"}
);
cards.push({no:"080",name:"뜨뜨뜨뜨",rarity:"MR",flavor:"망령의 검",scene:"푸른 망령의 불꽃을 두른 채 어둠을 가른다",palette:"cosmos"});
cards.push(...MOE_CARDS.map(({ artwork: _artwork, englishName: _englishName, description: _description, ...card }) => card));
const artwork:Record<string,string>={침착맨:"/cards/chimchakman-super-rare-art.png",랄로:"/cards/ralo-super-rare-art.png",곽튜브:"/cards/kwaktube-art-rare-art.png",빠더너스:"/cards/moonsanghoon-super-rare-art.png",감스트:"/cards/gamst-super-rare-art.png",피식대학:"/cards/psick-univ-rare-art.png",숏박스:"/cards/shortbox-art-rare-art.png",지무비:"/cards/gmovie-ultra-rare-art.png",말왕:"/cards/malwang-super-rare-art.png",보겸:"/cards/bokyem-super-rare-art.png",떵개떵:"/cards/tteong-art-rare-art.png",윤가놈:"/cards/yoonganom-super-rare-art.png"};
const completed:Record<string,string>={};
const english:Record<string,string>={침착맨:"CHIMCHAKMAN",랄로:"RALO",곽튜브:"KWAK TUBE",빠더너스:"BDNS",감스트:"GAMST",피식대학:"PSICK UNIV.",숏박스:"SHORT BOX",지무비:"G MOVIE",말왕:"MALWANG",보겸:"BOKYEM",떵개떵:"TTEONG",윤가놈:"YOONGANOM"};
const descriptions:Record<string,string>={침착맨:"흐름에 몸을 맡긴 채 의도치 않은 명언을 남긴다.",랄로:"하락장에도 자신만의 흐름을 보여준다.",곽튜브:"낯선 곳에서 새로운 사람과 이야기를 만난다.",빠더너스:"능청스러운 한마디로 수업을 시작한다.",감스트:"골이 터지는 순간, 누구보다 먼저 세레머니를 시작한다.",피식대학:"유쾌한 한마디가 도시의 공기를 바꾼다.",숏박스:"1분 만에 현실의 한 장면을 재현한다.",지무비:"영화보다 더 재미있는 목소리로 이야기를 완성한다.",말왕:"한계를 넘는 중량 앞에서 거침없이 전진한다.",보겸:"한 번의 인사로 가장 밝은 순간을 만든다.",떵개떵:"가득한 한 접시를 가장 맛있게 기록한다.",윤가놈:"전장을 지키는 영웅처럼 자신만의 기행을 이어간다."};
const displayTitles:Record<string,string>={윤가놈:"윤가놈(영웅)"};
Object.assign(artwork,{"주둥이방송 C":"/cards/joodoongi-common-art.png","랄로 C":"/cards/ralo-common-art.png","침착맨 C":"/cards/chimchakman-common-art.png","보겸 C":"/cards/bokyem-common-art.png","감스트 C":"/cards/gamst-common-art.png","숏박스 C":"/cards/shortbox-common-art.png"});
Object.assign(english,{"주둥이방송 C":"JOODOONGI","랄로 C":"RALO","침착맨 C":"CHIMCHAKMAN","보겸 C":"BOKYEM","감스트 C":"GAMST","숏박스 C":"SHORT BOX"});
Object.assign(descriptions,{"주둥이방송 C":"담백한 한 장면으로 방송을 시작한다.","랄로 C":"흐름을 읽으며 자신만의 시간을 보낸다.","침착맨 C":"오늘의 이야기를 편하게 꺼낸다.","보겸 C":"가벼운 인사로 순간을 채운다.","감스트 C":"축구 이야기에 마음을 싣는다.","숏박스 C":"가까운 일상을 유쾌하게 담아낸다."});
Object.assign(displayTitles,{"주둥이방송 C":"주둥이방송","랄로 C":"랄로","침착맨 C":"침착맨","보겸 C":"보겸","감스트 C":"감스트","숏박스 C":"숏박스"});
Object.assign(artwork,{"미미미누 C":"/cards/mimiminu-common-art.png","쯔앙 C":"/cards/jjeuang-common-art.png","곽튜브 C":"/cards/kwaktube-common-art.png"});
Object.assign(english,{"미미미누 C":"MIMIMINU","쯔앙 C":"JJEUANG","곽튜브 C":"KWAK TUBE"});
Object.assign(descriptions,{"미미미누 C":"가장 가까운 자리에서 응원을 건넨다.","쯔앙 C":"밝은 미소로 한 끼를 완성한다.","곽튜브 C":"새로운 길을 향해 가볍게 떠난다."});
Object.assign(displayTitles,{"미미미누 C":"미미미누","쯔앙 C":"쯔앙","곽튜브 C":"곽튜브"});
Object.assign(artwork,{김규남:"/cards/kimgyunam-super-rare-art.png",김계란:"/cards/kimegg-super-rare-art.png",엄지윤:"/cards/umjiyoon-super-rare-art.png",슈기:"/cards/syugi-art-rare-art.png",룩삼:"/cards/looksams-art-rare-art.png",유후:"/cards/yuhoo-art-rare-art.png","유후(각성)":"/cards/yuhoo-awakened-super-rare-art.png",주우재:"/cards/joowoojae-art-rare-art.png",카더가든:"/cards/cardergarden-mythic-rare-art.png"});
Object.assign(english,{김규남:"KIM GYUNAM",김계란:"KIM EGG",엄지윤:"UM JIYOON",슈기:"SYUGI",룩삼:"LOOKSAM",유후:"YUHOO","유후(각성)":"YUHOO · AWAKENED",주우재:"JOO WOOJAE",카더가든:"CAR, THE GARDEN"});
Object.assign(descriptions,{김규남:"구름처럼 포근한 미소로 가장 가벼운 인사를 건넨다.",김계란:"붉은 달 아래에서도 자신만의 훈련을 멈추지 않는다.",엄지윤:"경기장의 환호를 가장 밝은 표정으로 받아낸다.",슈기:"가득 찬 테이블 위에서 가장 맛있는 순간을 기록한다.",룩삼:"심야의 화면 앞에서 이야기를 함께 웃는다.",유후:"창가에 머문 햇살처럼 차분한 멜로디를 전한다.","유후(각성)":"각성한 손끝으로 모든 음을 무대 위에 불러낸다.",주우재:"담백한 태도로 가장 선명한 실루엣을 남긴다.",카더가든:"보랏빛 마도서에서 새로운 이야기를 꺼내 노래한다."});
Object.assign(artwork,{"031":"/cards/jangbbijju-super-rare-art.png","032":"/cards/hyean-super-rare-art.png","033":"/cards/orbit-super-rare-art.png","034":"/cards/gojaeyoung-super-rare-art.png","035":"/cards/woojunging-super-rare-art.png","036":"/cards/monster-rat-super-rare-art.png","037":"/cards/monster-rat-losing-mythic-rare-art.png","038":"/cards/pungja-super-rare-art.png","039":"/cards/redhair-ralo-mythic-rare-art.png","040":"/cards/hotsauce-super-rare-art.png","041":"/cards/limwooil-super-rare-art.png","042":"/cards/black-health-super-rare-art.png","043":"/cards/malwang-mythic-rare-art.png","044":"/cards/mimiminu-study-super-rare-art.png","045":"/cards/mimiminu-hero-super-rare-art.png","046":"/cards/black-health-workshop-super-rare-art.png","047":"/cards/pickgoe-super-rare-art.png","048":"/cards/jojinsae-super-rare-art.png","049":"/cards/kimwonhoon-super-rare-art.png","050":"/cards/space-hamster-mythic-rare-art.png","051":"/cards/nerdult-super-rare-art.png","052":"/cards/banzz-super-rare-art.png","053":"/cards/seungwoo-dad-super-rare-art.png","054":"/cards/kimpung-common-art.png","055":"/cards/joohomin-black-rare-art.png","056":"/cards/kwakbeom-common-art.png","057":"/cards/yooyeongwoo-common-art.png","058":"/cards/joowoojae-common-art.png","059":"/cards/woojunging-common-art.png","060":"/cards/jjeuyang-ultra-rare-art.png"});
Object.assign(english,{"031":"JANG BBIJJU","032":"HYEAN","033":"ORBIT","034":"GO JAEYOUNG","035":"WOOJUNGING","036":"MONSTER RAT","037":"MONSTER RAT · STREAK","038":"PUNGJA","039":"REDHAIR RALO","040":"HOTSAUCE","041":"LIM WOOIL","042":"BLACK HEALTH","043":"MALWANG · BLOCK KING","044":"MIMIMINU","045":"MIMIMINU","046":"BLACK HEALTH","047":"PICKGOEGENNAM","048":"JO JINSE","049":"KIM WONHOON","050":"SPACE HAMSTER","051":"NERDULT","052":"BANZZ","053":"SEUNGWOO DAD","054":"KIM POONG","055":"JOO HO-MIN","056":"KWAK BEOM","057":"YOO YOUNGWOO","058":"JOO WOOJAE","059":"WOOJUNGING","060":"TZUYANG"});
Object.assign(descriptions,{"031":"수많은 장면 속에서 자신만의 이야기를 완성한다.","032":"황혼의 경계에서 언제나 다음 수를 읽는다.","033":"별과 공식 사이에서 누구나 이해할 답을 이끈다.","034":"정상에서 마주한 풍경을 모두와 나눈다.","035":"한 잔의 커피처럼 부드럽게 순간을 바꾼다.","036":"결정적 한타에서 가장 먼저 손을 뻗는다.","037":"끝없는 연패의 밤도 결국 자신의 전설로 남긴다.","038":"뜨거운 한 점과 함께 밤의 테이블을 지배한다.","039":"한 장의 패로 언제든 판을 뒤집는다.","040":"장난기 가득한 두 사람이 오늘의 파티를 시작한다.","041":"골목의 공기까지 자기만의 장면으로 바꾼다.","042":"무게와 땀을 묵묵히 쌓아 올린다.","043":"블록의 세계에서도 가장 큰 한 방을 든다.","044":"고요한 새벽에도 끝까지 답을 찾아낸다.","045":"붉은 망토를 두르고 자신만의 왕국을 지킨다.","046":"거친 손끝으로 다음 한계를 만든다.","047":"햇살 같은 미소로 하루의 리듬을 채운다.","048":"생활관의 하루도 예술처럼 자기 방식으로 버틴다.","049":"도시의 노을 아래 다음 장면을 기다린다.","050":"은하와 소행성 사이를 가볍게 유영한다.","051":"세 명의 시선으로 가장 기묘한 사건을 추적한다.","052":"온 세상의 식재료를 한 팬에 담아낸다.","053":"강한 불맛으로 오늘의 한 접시를 완성한다.","054":"한 접시 위에 자기 이야기를 담는다.","055":"검은 먹빛으로 자신의 세계를 그린다.","056":"가볍게 웃으며 오늘의 장면을 만든다.","057":"한 번의 표정으로 장면을 뒤집는다.","058":"책과 함께 조용히 다음 날을 준비한다.","059":"밝은 미소로 오늘의 공기를 채운다.","060":"끝없는 식탁 위에서 행복한 한 입을 즐긴다."});
Object.assign(artwork,{"061":"/cards/ppapuri-common-art.png","062":"/cards/divajessica-rare-art.png","063":"/cards/ppanibottle-rare-art.png","064":"/cards/paca-rare-art.png","065":"/cards/jeradets-rare-art.png","066":"/cards/lee-sunmin-mythic-rare-art.png","067":"/cards/cheol-myeonsusim-common-art.png","068":"/cards/kim-minsu-common-art.png","069":"/cards/choi-joon-common-art.png","070":"/cards/woowakgood-common-art.png","071":"/cards/king-gihun-common-art.png","072":"/cards/daini-gong-rare-art.png","073":"/cards/teokhyeong-common-art.png","074":"/cards/eokbak-common-art.png","075":"/cards/imda-common-art.png","076":"/cards/yangdding-common-art.png"});
Object.assign(english,{"061":"PPAPURI","062":"DIVA JESSICA","063":"PPANI BOTTLE","064":"PACA","065":"JERADAT","066":"LEE SUNMIN","067":"CHEOL MYEON SUSIM","068":"KIM MINSU","069":"CHOI JOON","070":"WOOWAKGOOD","071":"KING GIHUN","072":"DAINI GONG","073":"TEOKHYEONG","074":"EOKBAK","075":"IMDA","076":"YANGDDING"});
Object.assign(descriptions,{"061":"게임과 웃음이 가득한 거실에서 가장 유쾌한 한 판을 시작한다.","062":"어둠 속 단서를 읽어내며 자신만의 미스터리를 완성한다.","063":"낯선 길 위에서 새로운 이야기와 가볍게 마주한다.","064":"노을이 지는 곳에서 다음 모험을 향해 뛰어든다.","065":"심야의 화면 앞에서 자신만의 승부를 이어간다.","066":"눈보라 속에서도 여유를 잃지 않는 설원의 군주.","067":"한 번의 엄지로 분위기를 뒤집는 뜨거운 응원을 보낸다.","068":"자신만의 박자로 오늘의 순간을 만든다.","069":"일상의 표정에서 다음 장면을 찾아낸다.","070":"가상과 현실 사이에서 새로운 이야기를 짓는다.","071":"방송의 중심에서 모두를 반기는 밤의 주인공.","072":"잔잔한 한 잔과 함께 이야기를 시작한다.","073":"한 장면을 자기만의 리듬으로 완성한다.","074":"마이크 앞에서 가장 단단한 소리를 낸다.","075":"가벼운 한 잔으로 오늘의 인사를 건넨다.","076":"픽셀 세계에 새로운 모험을 만든다."});
Object.assign(artwork,{"077":"/cards/ppogumi-super-rare-art.png","078":"/cards/yoonganom-common-art.png","079":"/cards/koobin-super-rare-art.png"});
Object.assign(english,{"077":"PPOGUMI","078":"YOONGANOM","079":"KOOBIN"});
Object.assign(descriptions,{"077":"가득한 응원 속에서 화면 너머로 다정하게 손을 뻗는다.","078":"한 번의 표정으로 오늘의 분위기를 바꾼다.","079":"보랏빛 라이브 속에서 자신만의 리듬을 만든다."});
Object.assign(artwork,{"080":"/cards/ttetteu-mythic-rare-art.png"});
Object.assign(english,{"080":"TTEUTTEUTTEU"});
Object.assign(descriptions,{"080":"푸른 망령의 불꽃을 두른 채 어둠을 가른다."});
MOE_CARDS.forEach((card) => { artwork[card.no] = card.artwork; english[card.no] = card.englishName; descriptions[card.no] = card.description; });
const accents:Record<Rarity,string>={"SECRET RARE":"#e8b8ff","SUPER RARE":"#ff8ca5","RARE":"#78bafc","COMMON":"#c3c6d2",UR:"#f6c65c",BR:"#24242b",MR:"#c59aff"};
function CardFace({card,serial,small=false}:{card:Card;serial:number;small?:boolean}){const serialNo=`${getPack(card.packId??"youtube").cardPrefix}-${card.no}-${String(serial).padStart(6,"0")}`;if(completed[card.name])return <article className={`tcg-complete ${small?"tcg-complete--compact":""}`}><img src={completed[card.name]} alt={`${card.name} 완성 카드`}/></article>;return <CardShell cardKey={card.no} name={displayTitles[card.no]||displayTitles[card.name]||card.name} englishName={english[card.no]||english[card.name]} rarity={card.rarity} serial={serialNo} skill={card.flavor} flavor={descriptions[card.no]||descriptions[card.name]||"크리에이터의 한 장면을 기록한 STARDEX 카드."} artwork={artwork[card.no]||artwork[card.name]} accent={accents[card.rarity]} palette={card.palette}/>}
function CardBack({index,flipped,children}:{index:number;flipped:boolean;children:React.ReactNode}){return <button className={`reveal-card ${flipped?"flipped":""}`} style={{"--i":index} as React.CSSProperties} aria-label={`${index+1}번째 카드 공개`}><span className="reveal-inner"><span className="card-back"><CardBackFace/></span><span className="card-front">{children}</span></span></button>}
export default function Home(){
  const [coin,setCoin]=useState(3000),[pulls,setPulls]=useState<Card[]>([]),[opening,setOpening]=useState<Opening>("shop"),[pack,setPack]=useState<Card[]>([]),[packType,setPackType]=useState<PackId>("youtube"),[flipped,setFlipped]=useState<number[]>([]),[revealing,setRevealing]=useState(false),[view,setView]=useState<"shop"|"collection">("shop"),[drag,setDrag]=useState(0),[showcase,setShowcase]=useState<(string|null)[]>(Array(9).fill(null)); const start=useRef(0);
  const owned=useMemo(()=>new Set(pulls.map(c=>c.no)),[pulls]);
  const rarityWeights:Record<Rarity,number>={COMMON:30,RARE:23,"SUPER RARE":23,MR:10,UR:8,BR:6,"SECRET RARE":0};
  const packCards=cards.filter(card=>(card.packId??"youtube")===packType);
  const draw=()=>{const available=(Object.entries(rarityWeights) as [Rarity,number][]).filter(([,weight])=>weight>0);const roll=Math.random()*available.reduce((sum,[,weight])=>sum+weight,0);let cursor=0;const rarity=available.find(([ ,weight])=>(cursor+=weight)>roll)?.[0]||"COMMON";const pool=packCards.filter(card=>card.rarity===rarity);return pool[Math.floor(Math.random()*pool.length)]||packCards[0]};
  const buy=()=>{if(coin<1||!packCards.length)return;const rarityOrder:Record<Rarity,number>={COMMON:0,RARE:1,"SUPER RARE":2,MR:3,UR:4,BR:5,"SECRET RARE":2};const nextPack=[draw(),draw(),draw(),draw(),draw()].sort((a,b)=>rarityOrder[a.rarity]-rarityOrder[b.rarity]);setCoin(v=>v-1);setPack(nextPack);setFlipped([]);setDrag(0);setOpening("tear")};
useEffect(()=>{if(opening!=="box")return;const timer=window.setTimeout(()=>setOpening("tear"),3200);return()=>window.clearTimeout(timer)},[opening]);
  const begin=(e:PointerEvent<HTMLDivElement>)=>{start.current=e.clientY;e.currentTarget.setPointerCapture(e.pointerId)};
  const move=(e:PointerEvent<HTMLDivElement>)=>{if(!start.current)return;const next=Math.max(0,Math.min(100,(start.current-e.clientY)*1.25));setDrag(next);if(next>=100){start.current=0;setTimeout(()=>setOpening("deal"),180)}};
  const end=()=>{if(drag<100)setDrag(0);start.current=0};
  const flip=(index:number)=>{if(revealing||flipped.includes(index))return;const next=[...flipped,index],rarity=pack[index].rarity,effect=rarity==="SUPER RARE"?"pull-sr":rarity==="MR"?"pull-mr":rarity==="UR"?"pull-ur":rarity==="BR"?"pull-br":"",suspense=rarity==="MR"?650:rarity==="UR"?850:rarity==="BR"?1000:0,duration=suspense?suspense+900:900;setRevealing(true);if(effect)document.body.classList.add(effect);if(suspense)setTimeout(()=>setFlipped(next),suspense);else setFlipped(next);setTimeout(()=>{if(effect)document.body.classList.remove(effect);setRevealing(false)},duration);if(next.length===5){setPulls(v=>[...v,...pack]);setTimeout(()=>setOpening("result"),duration+120)}};
  const reset=()=>{setOpening("shop");setPack([]);setFlipped([])};
  return <main className="app-shell"><nav className="topbar"><a className="logo" href="#top" onClick={()=>{setView("shop");reset()}}>STARDEX</a><div className="nav-links"><button className={view==="shop"?"active":""} onClick={()=>{setView("shop");reset()}}>PACK SHOP</button><button className={view==="collection"?"active":""} onClick={()=>setView("collection")}>COLLECTION <em>{owned.size}/{cards.length}</em></button></div><div className="topbar-actions"><div className="balance"><span>◇</span>{coin.toLocaleString()} COIN</div><AuthWidget /></div></nav>{view==="collection"?<CollectionExperience cards={cards} owned={owned} showcase={showcase} onShowcaseChange={setShowcase} renderCard={(card,serial)=><CardFace card={card as Card} serial={serial} small/>}/>:opening==="shop"?<Shop coin={coin} packType={packType} onPackChange={setPackType} packCards={packCards} buy={buy}/>:<OpeningFlow mode={opening} pack={pack} packType={packType} drag={drag} flipped={flipped} begin={begin} move={move} end={end} flip={flip} reset={reset} owned={owned}/>} {view==="shop"&&opening==="shop"&&<SiteNotice/>}<footer>STARDEX is a non-commercial fan project. © 2026</footer></main>
}
function SiteNotice(){return <aside className="site-notice" aria-label="STARDEX 안내"><p className="eyebrow">NOTICE</p><h2>STARDEX는 독립 팬 제작 사이트입니다.</h2><p>본 게임 및 사이트는 특정 유튜버·크리에이터와 공식적으로 관련이 없으며, 수익 목적 없이 운영됩니다.</p><div><b>카드 정보 제보</b><span>“XXX님도 추가해주세요.” · “XXX님 내려주세요.” · “XXX님 등급을 변경해주세요.” · “XXX님 카드 정보를 수정해주세요.”</span></div><p>문의 및 수정 제안은 <a href="mailto:jeonseong0120@gmail.com">jeonseong0120@gmail.com</a>으로 부탁드립니다.</p></aside>}
function Shop({coin,buy,packType,onPackChange,packCards}:{coin:number;buy:()=>void;packType:PackId;onPackChange:(id:PackId)=>void;packCards:Card[]}){
  return <section id="top" className="lobby-view">
    <div className="lobby-heading">
      <p className="eyebrow">STARDEX CARD COLLECTION</p>
      <h1>CHOOSE A PACK.</h1>
    </div>
    <div className="box-carousel box-carousel--packs" aria-label="STARDEX 팩 선택">
      <button className="pack-arrow pack-arrow--left" onClick={()=>onPackChange("youtube")} aria-label="이전 팩">‹</button>
      <button className={`booster-box booster-box--product ${packType==="youtube"?"is-selected":""}`} style={{"--side":packType==="youtube"?0:-1,"--order":packType==="youtube"?2:1} as React.CSSProperties} onClick={()=>onPackChange("youtube")} aria-label="YouTuber Creator Pack 선택">
        <span className="product-box" aria-hidden="true"><span className="product-box__lid"/><span className="product-box__side"/><span className="product-box__front"/></span>
      </button>
      <button className={`booster-box booster-box--moe ${packType==="moe"?"is-selected":""}`} style={{"--side":packType==="moe"?0:1,"--order":packType==="moe"?2:1} as React.CSSProperties} onClick={()=>onPackChange("moe")} aria-label="Moe Collection 팩 선택">
        <img className="moe-box-render" src="/moe-collection-product-v2.png" alt="STARDEX Moe Collection 박스와 부스터 팩"/>
      </button>
      <button className="pack-arrow pack-arrow--right" onClick={()=>onPackChange("moe")} aria-label="다음 팩">›</button>
    </div>
    <div className="open-area">
      <div className="selected-pack-label"><b>{packType==="moe"?"MOE COLLECTION":"YOUTUBER CREATOR PACK"}</b><span>{packType==="moe"?"팬메이드 모에몬 테마":"STARDEX 기본 컬렉션"}</span></div>
      <button className="open-button" onClick={buy} disabled={coin<1||!packCards.length}>{packCards.length?"OPEN THIS BOX":"CARDS COMING SOON"} <span>{packCards.length?"1 ◇":""}</span></button>
      <p>TEST MODE · 모든 카드 동일 확률</p>
    </div>
  </section>
}
function OpeningFlow({mode,pack,packType,drag,flipped,begin,move,end,flip,reset,owned}:{mode:Opening;pack:Card[];packType:PackId;drag:number;flipped:number[];begin:(e:PointerEvent<HTMLDivElement>)=>void;move:(e:PointerEvent<HTMLDivElement>)=>void;end:()=>void;flip:(i:number)=>void;reset:()=>void;owned:Set<string>}){const series=getPack(packType);if(mode==="box")return <section className={`box-opening-screen box-opening-screen--${packType}`} aria-label={`${series.label} 개봉 중`}><p className="eyebrow">UNSEALING {series.label}</p><div className="opening-assembly"><span className="opening-assembly__shadow"/><div className="opening-assembly__box"><span className="opening-assembly__rear"/><span className="opening-assembly__lid"/><span className="opening-assembly__pack opening-assembly__pack--one"/><span className="opening-assembly__pack opening-assembly__pack--two"/><span className="opening-assembly__pack opening-assembly__pack--three"/><span className="opening-assembly__side"/><span className="opening-assembly__front"/></div></div><p className="box-opening-copy">{series.openingCopy}</p></section>;if(mode==="tear")return <section className={`opening-screen opening-screen--tear opening-screen--${packType}`}><div className="tear-atmosphere" aria-hidden="true"><span/><span/><span/><span/></div><div className="tear-copy"><p className="eyebrow">{series.openingEyebrow}</p><h2>위로 밀어서<br/><i>팩을 뜯으세요.</i></h2><p>{series.openingCopy}</p></div><div className="tear-zone" onPointerDown={begin} onPointerMove={move} onPointerUp={end} onPointerCancel={end}><div className="tear-pack" style={{transform:`translateY(${-drag*.45}px)`,clipPath:`polygon(0 ${drag*.45}%,100% 0,100% 100%,0 100%)`}}><img className="tear-pack__render" src={series.packArt} alt={`${series.label} 부스터 팩`}/></div><div className="tear-line" style={{bottom:`${drag}%`}}><b>✂</b></div></div><p className="drag-hint">{drag?`${Math.round(drag)}%`:`SWIPE UP`}</p></section>;if(mode==="deal")return <section className={`opening-screen deal-screen deal-screen--${packType}`}><p className="eyebrow">{series.label} · TAP EACH CARD TO REVEAL</p><h2>무엇이 나왔을까.</h2><div className="reveal-fan">{pack.map((card,index)=><div key={`${card.no}-${index}`} onClick={()=>flip(index)}><CardBack index={index} flipped={flipped.includes(index)}><CardFace card={card} serial={pullsSerial(index)}/></CardBack></div>)}</div><p className="drag-hint">{flipped.length} / 5 REVEALED</p></section>;const fresh=pack.filter(c=>!owned.has(c.no)).length;return <section className={`result-screen result-screen--${packType}`}><p className="eyebrow">{series.label} · PACK RESULTS</p><h2>COLLECTION<br/><i>UPDATED</i></h2><div className="result-grid">{pack.map((card,index)=><div className="result-item" key={`${card.no}-${index}`}><CardFace card={card} serial={pullsSerial(index)} small/><b className={owned.has(card.no)?"duplicate":"new"}>{owned.has(card.no)?"DUPLICATE +1":"NEW"}</b></div>)}</div><p className="summary"><b>{fresh} NEW CARD{fresh===1?"":"S"}</b> · 중복 카드는 추후 Dust로 분해할 수 있어요.</p><button className="open-button" onClick={reset}>BACK TO SHOP</button></section>}
const pullsSerial=(index:number)=>Math.floor(Date.now()/1000)%100000+index;
