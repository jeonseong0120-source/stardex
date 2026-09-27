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

/** The system shop is deliberately less favorable than a direct player exchange. */
export function systemBuyPrice(cardId: string, rarity: string) {
  return Math.ceil((marketPrice(cardId, rarity) * 1.35) / 10) * 10;
}

/** Instant system purchase price for duplicate cards; the archive copy stays protected. */
export function systemSellPrice(cardId: string, rarity: string) {
  return Math.floor((marketPrice(cardId, rarity) * 0.6) / 10) * 10;
}
