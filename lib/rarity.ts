import type { PackId, PackRarity } from "../components/packs/pack-catalog";

export const NORMAL_PACK_WEIGHTS: Record<PackId, Record<PackRarity, number>> = {
  youtube: { COMMON: 55, RARE: 30, "SUPER RARE": 12, MR: 2.4, UR: 0.58, BR: 0.02, "SECRET RARE": 0 },
  moe: { COMMON: 0, RARE: 66, "SUPER RARE": 27.5, MR: 5, UR: 1.48, BR: 0.02, "SECRET RARE": 0 },
};

export const GOD_PACK_CHANCE = 0.001;
export const GOD_PACK_WEIGHTS: Record<PackRarity, number> = {
  COMMON: 0, RARE: 0, "SUPER RARE": 0, MR: 83, UR: 16, BR: 1, "SECRET RARE": 0,
};
