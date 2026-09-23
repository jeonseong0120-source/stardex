import type { PackRarity } from "./pack-catalog";

export type MoeCardSeed = {
  no: string;
  name: string;
  rarity: PackRarity;
  flavor: string;
  scene: string;
  palette: string;
  packId: "moe";
  artwork: string;
  englishName: string;
  description: string;
};

export const MOE_CARDS: MoeCardSeed[] = [
  { no: "081", name: "야돈", rarity: "SUPER RARE", flavor: "느긋한 오후", scene: "분홍빛 항구에서 가장 느린 시간을 보낸다.", palette: "sunset", packId: "moe", artwork: "/cards/moe-slowpoke-sr.png", englishName: "SLOWPOKE", description: "조급함 없는 하루가 결국 가장 멀리 데려다준다." },
  { no: "082", name: "고라파덕", rarity: "SUPER RARE", flavor: "생각의 파도", scene: "노란 빛 도시에서 수많은 생각을 잠재운다.", palette: "sunny", packId: "moe", artwork: "/cards/moe-psyduck-sr.png", englishName: "PSYDUCK", description: "복잡한 마음도 한 번의 물결처럼 흘려보낸다." },
  { no: "083", name: "팬텀", rarity: "MR", flavor: "그림자의 웃음", scene: "보랏빛 연무 속에서 장난스러운 미소를 남긴다.", palette: "mythic", packId: "moe", artwork: "/cards/moe-gengar-mr.png", englishName: "GENGAR", description: "가장 어두운 곳에서 가장 선명한 웃음이 들린다." },
  { no: "084", name: "가디안", rarity: "SUPER RARE", flavor: "수호의 맹세", scene: "꽃잎이 흐르는 성소에서 손을 내민다.", palette: "study", packId: "moe", artwork: "/cards/moe-gardevoir-sr.png", englishName: "GARDEVOIR", description: "언제나 가장 가까운 곳에서 당신을 지켜본다." },
  { no: "085", name: "피카츄", rarity: "SUPER RARE", flavor: "번개의 미소", scene: "전기가 흐르는 골목에서 가장 먼저 손을 흔든다.", palette: "sunny", packId: "moe", artwork: "/cards/moe-pikachu-sr.png", englishName: "PIKACHU", description: "작은 불꽃 하나가 세상을 환하게 바꾼다." },
  { no: "086", name: "칠색조", rarity: "UR", flavor: "여명의 날개", scene: "새벽 하늘을 가르며 찬란한 깃털을 흩뿌린다.", palette: "sunset", packId: "moe", artwork: "/cards/moe-hooh-ur.png", englishName: "HO-OH", description: "빛나는 날개가 새로운 시작의 방향을 가리킨다." },
  { no: "087", name: "루카리오", rarity: "MR", flavor: "파동의 검사", scene: "달빛 아래, 푸른 파동으로 전장을 가른다.", palette: "cosmos", packId: "moe", artwork: "/cards/moe-lucario-mr.png", englishName: "LUCARIO", description: "고요한 눈빛으로 가장 강한 파동을 읽어낸다." },
  { no: "088", name: "리자몽", rarity: "SUPER RARE", flavor: "화염의 비상", scene: "타오르는 하늘을 등지고 불꽃의 궤적을 남긴다.", palette: "ember", packId: "moe", artwork: "/cards/moe-charizard-sr.png", englishName: "CHARIZARD", description: "불타는 날개가 한계를 넘어 하늘로 솟는다." },
  { no: "089", name: "거북왕", rarity: "SUPER RARE", flavor: "파도의 포격", scene: "부서지는 물결 한가운데에서 모든 것을 밀어낸다.", palette: "sky", packId: "moe", artwork: "/cards/moe-blastoise-sr.png", englishName: "BLASTOISE", description: "깊고 묵직한 파도가 승부의 흐름을 바꾼다." },
  { no: "090", name: "이상해꽃", rarity: "SUPER RARE", flavor: "개화의 숲", scene: "빗방울 맺힌 꽃잎 아래에서 숲의 기운을 깨운다.", palette: "verdant", packId: "moe", artwork: "/cards/moe-venusaur-sr.png", englishName: "VENUSAUR", description: "피어난 꽃과 함께 가장 깊은 생명의 힘을 전한다." },
  { no: "091", name: "뮤 & 뮤츠", rarity: "BR", flavor: "초월의 공명", scene: "달빛 아래 두 개의 힘이 하나의 세계를 울린다.", palette: "arcane", packId: "moe", artwork: "/cards/moe-mew-mewtwo-br.png", englishName: "MEW & MEWTWO", description: "서로 다른 두 존재가 가장 강한 공명을 완성한다." },
  { no: "092", name: "아보크", rarity: "RARE", flavor: "독사의 매혹", scene: "보랏빛 폐허의 노을 속에서 조용히 몸을 일으킨다.", palette: "mythic", packId: "moe", artwork: "/cards/moe-arbok-r.png", englishName: "ARBOK", description: "위협적인 눈빛과 우아한 움직임으로 어둠을 지배한다." },
  { no: "093", name: "아보", rarity: "RARE", flavor: "독침의 위압", scene: "초록빛 숲의 경계에서 조용히 기척을 감춘다.", palette: "verdant", packId: "moe", artwork: "/cards/moe-arbok-c.png", englishName: "ARBOK", description: "날카로운 눈빛으로 숲의 질서를 지킨다." },
  { no: "094", name: "뮤츠(x)", rarity: "MR", flavor: "유전자 코드", scene: "보랏빛 연구시설에서 태초의 기억을 되살린다.", palette: "mythic", packId: "moe", artwork: "/cards/moe-mew-mr.png", englishName: "MEWTWO X", description: "모든 가능성의 시작이 된 작은 기적." },
  { no: "095", name: "뮤츠(y)", rarity: "MR", flavor: "초월의 실험", scene: "깨진 연구시설 속에서 압도적인 힘을 드러낸다.", palette: "mythic", packId: "moe", artwork: "/cards/moe-mewtwo-x-mr.png", englishName: "MEWTWO Y", description: "통제할 수 없는 힘이 새로운 형태로 각성한다." },
  { no: "096", name: "잠만보", rarity: "RARE", flavor: "정신의 파동", scene: "달빛 아래에서 날카로운 정신의 파동을 펼친다.", palette: "cosmos", packId: "moe", artwork: "/cards/moe-mewtwo-y-sr.png", englishName: "SNORLAX", description: "생각만으로 세계의 흐름을 바꾸는 초능력." },
  { no: "097", name: "잠만보", rarity: "RARE", flavor: "낮잠의 숲", scene: "나뭇잎 사이 따뜻한 햇살 아래 평화롭게 잠든다.", palette: "sky", packId: "moe", artwork: "/cards/moe-snorlax-r.png", englishName: "SNORLAX", description: "느긋한 휴식도 모험의 일부가 된다." },
  { no: "098", name: "나인테일(암컷)", rarity: "SUPER RARE", flavor: "구미호의 달빛", scene: "붉은 등불 아래 아홉 꼬리를 펼친다.", palette: "ember", packId: "moe", artwork: "/cards/moe-ninetales-m-sr.png", englishName: "NINETALES", description: "달빛을 머금은 꼬리가 오래된 전설을 부른다." },
  { no: "099", name: "나인테일(수컷)", rarity: "SUPER RARE", flavor: "홍련의 춤", scene: "꽃잎 흩날리는 밤의 정원에서 우아하게 춤춘다.", palette: "ember", packId: "moe", artwork: "/cards/moe-ninetales-f-sr.png", englishName: "NINETALES · BLOSSOM", description: "붉은 꽃과 불꽃이 하나의 춤으로 피어난다." },
  { no: "102", name: "캐터피", rarity: "SUPER RARE", flavor: "새벽의 잎사귀", scene: "이슬 맺힌 잎 위에서 조용히 아침을 맞는다.", palette: "verdant", packId: "moe", artwork: "/cards/moe-caterpie-sr.png", englishName: "CATERPIE", description: "작은 생명이 새로운 계절을 준비한다." },
  { no: "103", name: "구구", rarity: "RARE", flavor: "바람의 시작", scene: "맑은 숲길 위로 첫 비행을 시작한다.", palette: "sky", packId: "moe", artwork: "/cards/moe-pidgey-c.png", englishName: "PIDGEY", description: "가벼운 날갯짓으로 오늘의 방향을 찾는다." },
  { no: "104", name: "피죤투", rarity: "SUPER RARE", flavor: "하늘의 질주", scene: "구름 사이를 가르며 넓은 하늘로 솟아오른다.", palette: "sky", packId: "moe", artwork: "/cards/moe-pidgeot-sr.png", englishName: "PIDGEOT", description: "거대한 날개가 하늘의 지평을 가른다." },
  { no: "105", name: "니드킹", rarity: "SUPER RARE", flavor: "보랏빛 돌진", scene: "부서지는 바위 사이에서 강인한 힘을 일으킨다.", palette: "mythic", packId: "moe", artwork: "/cards/moe-nidoking-sr.png", englishName: "NIDOKING", description: "압도적인 힘으로 길을 가로막는 모든 것을 무너뜨린다." },
  { no: "106", name: "윈디", rarity: "SUPER RARE", flavor: "화염의 질주", scene: "불꽃이 휘몰아치는 전장에서 맹렬히 달려든다.", palette: "flame", packId: "moe", artwork: "/cards/moe-arcanine-sr.png", englishName: "ARCANINE", description: "타오르는 갈기를 휘날리며 전장을 가른다." },
  { no: "107", name: "라이츄(암컷)", rarity: "RARE", flavor: "노란 파도", scene: "햇살 아래서 꼬리의 전류를 가볍게 튕긴다.", palette: "sunny", packId: "moe", artwork: "/cards/moe-raichu-f-r.png", englishName: "RAICHU", description: "작은 전기와 함께 발랄한 하루를 시작한다." },
  { no: "108", name: "라이츄(수컷)", rarity: "RARE", flavor: "전기의 서핑", scene: "빛나는 파도 위에서 균형을 잡으며 웃는다.", palette: "sunny", packId: "moe", artwork: "/cards/moe-raichu-m-r.png", englishName: "RAICHU · SURF", description: "전류를 타고 자유롭게 새로운 길을 찾는다." },
  { no: "109", name: "블래키", rarity: "RARE", flavor: "밤의 문양", scene: "푸른 달빛 아래 조용히 어둠을 걷는다.", palette: "midnight", packId: "moe", artwork: "/cards/moe-umbreon-r.png", englishName: "UMBREON", description: "어둠 속 빛나는 문양이 밤의 길을 안내한다." },
  { no: "110", name: "이브이", rarity: "RARE", flavor: "작은 모험", scene: "따뜻한 숲길에서 새로운 친구를 기다린다.", palette: "sunset", packId: "moe", artwork: "/cards/moe-eevee-r.png", englishName: "EEVEE", description: "아직 정해지지 않은 가능성이 꼬리를 흔든다." },
  { no: "111", name: "모래두지", rarity: "SUPER RARE", flavor: "사막의 수호", scene: "금빛 모래바람 속에서 단단히 몸을 웅크린다.", palette: "ember", packId: "moe", artwork: "/cards/moe-sandslash-sr.png", englishName: "SANDSHREW", description: "거친 모래 속에서도 자신만의 자리를 지킨다." },
  { no: "112", name: "따라큐", rarity: "RARE", flavor: "낡은 가면", scene: "조용한 숲의 그늘에서 살짝 고개를 내민다.", palette: "ink", packId: "moe", artwork: "/cards/moe-mimikyu-r.png", englishName: "MIMIKYU", description: "작은 가면 뒤에 숨겨둔 다정한 마음을 전한다." },
  { no: "113", name: "블래키(야행)", rarity: "RARE", flavor: "검은 달", scene: "노란 달빛과 검은 옷자락이 밤을 물들인다.", palette: "midnight", packId: "moe", artwork: "/cards/moe-umbreon-alt-r.png", englishName: "UMBREON · NOCTURNE", description: "깊은 밤의 기척을 따라 조용히 모습을 드러낸다." },
  { no: "114", name: "샤미드", rarity: "RARE", flavor: "물빛의 춤", scene: "푸른 파도와 함께 투명한 빛을 펼친다.", palette: "sky", packId: "moe", artwork: "/cards/moe-vaporeon-r.png", englishName: "VAPOREON", description: "물결처럼 유연한 움직임으로 바다를 누빈다." },
  { no: "115", name: "메타몽", rarity: "SUPER RARE", flavor: "보랏빛 변신", scene: "말랑한 빛의 숲에서 어떤 모습으로든 변신한다.", palette: "mythic", packId: "moe", artwork: "/cards/moe-ditto-sr.png", englishName: "DITTO", description: "무한한 가능성을 품은 작은 변신의 기적." },
  { no: "116", name: "롱스톤", rarity: "SUPER RARE", flavor: "암석의 심장", scene: "부서진 바위 계곡에서 강철 같은 의지를 드러낸다.", palette: "iron", packId: "moe", artwork: "/cards/moe-onix-sr.png", englishName: "ONIX", description: "거대한 암석의 몸으로 대지를 가르며 나아간다." },
  { no: "117", name: "뮤", rarity: "MR", flavor: "태초의 기적", scene: "보랏빛 별의 바다에서 태초의 생명이 모습을 드러낸다.", palette: "mythic", packId: "moe", artwork: "/cards/moe-mew-mr-2.png", englishName: "MEW", description: "모든 가능성의 시작이 된 작은 기적." },
  { no: "118", name: "푸린", rarity: "SUPER RARE", flavor: "핑크 스테이지", scene: "환호 가득한 무대에서 달콤한 노래를 부른다.", palette: "sunny", packId: "moe", artwork: "/cards/moe-jigglypuff-sr-2.png", englishName: "JIGGLYPUFF", description: "한 소절의 노래로 모두의 마음을 사로잡는다." },
  { no: "119", name: "찌리리공", rarity: "SUPER RARE", flavor: "폭발의 질주", scene: "붉은 에너지가 폭발하는 전장 한가운데로 돌진한다.", palette: "ember", packId: "moe", artwork: "/cards/moe-voltorb-sr.png", englishName: "VOLTORB", description: "짜릿한 전류와 함께 한계까지 에너지를 끌어올린다." },
  { no: "120", name: "샤미드", rarity: "SUPER RARE", flavor: "물빛의 성소", scene: "깊은 물빛 성소에서 고요한 파도를 일으킨다.", palette: "sky", packId: "moe", artwork: "/cards/moe-vaporeon-sr-2.png", englishName: "VAPOREON", description: "투명한 물결처럼 유연하게 빛을 머금는다." },
  { no: "121", name: "잉어킹", rarity: "RARE", flavor: "작은 도약", scene: "잔잔한 물결 위로 힘차게 몸을 튕긴다.", palette: "sky", packId: "moe", artwork: "/cards/moe-jolteon-sr.png", englishName: "MAGIKARP", description: "작은 도약이 언젠가 큰 파도를 만든다." },
  { no: "122", name: "갸라도스", rarity: "MR", flavor: "심해의 분노", scene: "폭풍치는 심해에서 거대한 힘을 깨운다.", palette: "cosmos", packId: "moe", artwork: "/cards/moe-magikarp-r.png", englishName: "GYARADOS", description: "깊은 바다의 분노가 하늘까지 솟구친다." },
  { no: "123", name: "갸라도스", rarity: "SUPER RARE", flavor: "푸른 포효", scene: "얼어붙은 파도 사이에서 거대한 포효를 울린다.", palette: "sky", packId: "moe", artwork: "/cards/moe-gyarados-mr.png", englishName: "GYARADOS", description: "압도적인 물결이 전장의 모든 시선을 사로잡는다." },
  { no: "124", name: "스라크", rarity: "RARE", flavor: "숲의 쌍검", scene: "초록빛 숲을 가르며 날카로운 칼날을 휘두른다.", palette: "verdant", packId: "moe", artwork: "/cards/moe-scyther-r.png", englishName: "SCYTHER", description: "바람처럼 빠른 두 칼날이 길을 연다." },
  { no: "125", name: "아쿠스타", rarity: "RARE", flavor: "별빛의 조류", scene: "수면 아래 별빛을 품고 조용히 떠오른다.", palette: "sky", packId: "moe", artwork: "/cards/moe-starmie-r.png", englishName: "STARMIE", description: "푸른 보석의 빛이 밤바다를 비춘다." },
  { no: "126", name: "쥬피썬더", rarity: "SUPER RARE", flavor: "황금 전격", scene: "황금빛 전격과 함께 폭풍의 중심을 가른다.", palette: "sunny", packId: "moe", artwork: "/cards/moe-jolteon-sr-2.png", englishName: "JOLTEON", description: "번개의 심장이 가장 눈부신 순간을 만든다." },
  { no: "127", name: "부스터", rarity: "SUPER RARE", flavor: "화염의 휴식", scene: "붉은 요새의 석양 아래 뜨거운 숨을 고른다.", palette: "ember", packId: "moe", artwork: "/cards/moe-flareon-sr.png", englishName: "FLAREON", description: "따뜻한 불꽃이 전장의 긴장을 녹여낸다." },
  { no: "129", name: "라프라스", rarity: "MR", flavor: "빙해의 노래", scene: "오로라 아래 얼어붙은 바다를 조용히 헤엄친다.", palette: "cosmos", packId: "moe", artwork: "/cards/moe-lapras-mr.png", englishName: "LAPRAS", description: "차가운 바다 위에 오래된 노래를 띄운다." },
  { no: "130", name: "루주라", rarity: "RARE", flavor: "빙결의 스텝", scene: "수정 빙원 위에서 신비로운 춤을 춘다.", palette: "mythic", packId: "moe", artwork: "/cards/moe-jynx-r.png", englishName: "JYNX", description: "얼음처럼 반짝이는 리듬이 공간을 물들인다." },
  { no: "131", name: "부스터", rarity: "MR", flavor: "홍련의 군주", scene: "불타는 요새의 중심에서 화염의 왕관을 쓴다.", palette: "ember", packId: "moe", artwork: "/cards/moe-flareon-mr.png", englishName: "FLAREON", description: "압도적인 화염이 밤의 왕좌를 붉게 밝힌다." },
  { no: "132", name: "에레브", rarity: "SUPER RARE", flavor: "전격의 무대", scene: "폭풍과 조명이 교차하는 무대에서 전류를 폭발시킨다.", palette: "sunny", packId: "moe", artwork: "/cards/moe-electabuzz-sr.png", englishName: "ELECTABUZZ", description: "강렬한 전격이 무대와 하늘을 동시에 흔든다." },
];
