export const marketBaseValues: Record<string, number> = {
  COMMON: 100,
  RARE: 300,
  "SUPER RARE": 1000,
  MR: 3000,
  UR: 10000,
  BR: 30000,
};

/** Fixed, server-authoritative card price used by the peer marketplace. */
export function marketPrice(cardId: string, rarity: string) {
  const base = marketBaseValues[rarity] ?? 100;
  return Math.round((base * (0.8 + ((Number(cardId) % 14) / 10))) / 10) * 10;
}
