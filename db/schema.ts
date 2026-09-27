import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex, primaryKey, index } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  googleSub: text("google_sub").notNull(),
  email: text("email").notNull(),
  name: text("name").notNull().default(""),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("USER"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({ googleSubIdx: uniqueIndex("users_google_sub_unique").on(table.googleSub) }));

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const cards = sqliteTable("cards", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  rarity: text("rarity").notNull(),
  artworkUrl: text("artwork_url").notNull(),
  metadataJson: text("metadata_json").notNull().default("{}"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const userCards = sqliteTable("user_cards", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  cardId: text("card_id").notNull().references(() => cards.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({ pk: primaryKey({ columns: [table.userId, table.cardId] }) }));

export const userCollectionStates = sqliteTable("user_collection_states", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  coin: integer("coin").notNull().default(3000),
  showcaseJson: text("showcase_json").notNull().default("[]"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const marketplaceListings = sqliteTable("marketplace_listings", {
  id: text("id").primaryKey(),
  sellerId: text("seller_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  cardId: text("card_id").notNull().references(() => cards.id, { onDelete: "cascade" }),
  price: integer("price").notNull(),
  status: text("status").notNull().default("LISTED"),
  buyerId: text("buyer_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  soldAt: text("sold_at"),
}, (table) => ({
  statusCardIdx: index("marketplace_listing_status_card_id_idx").on(table.status, table.cardId, table.id),
  sellerStatusIdx: index("marketplace_listing_seller_status_id_idx").on(table.sellerId, table.status, table.id),
}));
