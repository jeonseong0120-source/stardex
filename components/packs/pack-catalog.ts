export type PackId = "youtube" | "moe";
export type PackRarity = "COMMON" | "RARE" | "SUPER RARE" | "SECRET RARE" | "UR" | "BR" | "MR";

export type PackDefinition = {
  id: PackId;
  label: string;
  subtitle: string;
  collectionTitle: string;
  collectionSubtitle: string;
  openingEyebrow: string;
  openingCopy: string;
  boxArt: string;
  packArt: string;
  cardPrefix: string;
};

export const PACKS: Record<PackId, PackDefinition> = {
  youtube: {
    id: "youtube",
    label: "크리에이터 팩",
    subtitle: "STARDEX 기본 컬렉션",
    collectionTitle: "유튜브",
    collectionSubtitle: "다양한 크리에이터, 다양한 이야기를 수집해보세요.",
    openingEyebrow: "STARDEX · 크리에이터 카드 컬렉션",
    openingCopy: "좋아하는 크리에이터를 한 장의 카드로 만나보세요.",
    boxArt: "/booster-box-archive-v1.png",
    packArt: "/booster-pack-archive-v1.png",
    cardPrefix: "STX-YT01",
  },
  moe: {
    id: "moe",
    label: "모에몬 컬렉션",
    subtitle: "팬메이드 모에몬 테마",
    collectionTitle: "모에몬",
    collectionSubtitle: "새로운 모험과 캐릭터를 카드로 수집해보세요.",
    openingEyebrow: "STARDEX · 모에몬 컬렉션",
    openingCopy: "새로운 모에몬 카드를 한 장씩 발견해보세요.",
    boxArt: "/moe-collection-product-v2.png",
    packArt: "/moe-booster-pack-v2.png",
    cardPrefix: "STX-MOE01",
  },
};

export const getPack = (id: PackId) => PACKS[id];
