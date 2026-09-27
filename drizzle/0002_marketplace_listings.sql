CREATE TABLE `marketplace_listings` (
  `id` text PRIMARY KEY NOT NULL,
  `seller_id` text NOT NULL,
  `card_id` text NOT NULL,
  `price` integer NOT NULL,
  `status` text DEFAULT 'LISTED' NOT NULL,
  `buyer_id` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `sold_at` text,
  FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `marketplace_listing_status_card_id_idx` ON `marketplace_listings` (`status`,`card_id`,`id`);
--> statement-breakpoint
CREATE INDEX `marketplace_listing_seller_status_id_idx` ON `marketplace_listings` (`seller_id`,`status`,`id`);
