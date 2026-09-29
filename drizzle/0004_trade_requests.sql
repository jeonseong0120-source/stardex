CREATE TABLE `trade_requests` (
  `id` text PRIMARY KEY NOT NULL,
  `listing_id` text NOT NULL,
  `requester_id` text NOT NULL,
  `recipient_id` text NOT NULL,
  `offered_card_id` text NOT NULL,
  `requested_card_id` text NOT NULL,
  `status` text DEFAULT 'PENDING' NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `responded_at` text,
  FOREIGN KEY (`listing_id`) REFERENCES `marketplace_listings`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`requester_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`offered_card_id`) REFERENCES `cards`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`requested_card_id`) REFERENCES `cards`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `trade_request_listing_status_idx` ON `trade_requests` (`listing_id`,`status`);
--> statement-breakpoint
CREATE INDEX `trade_request_recipient_status_idx` ON `trade_requests` (`recipient_id`,`status`,`created_at`);
--> statement-breakpoint
CREATE INDEX `trade_request_requester_status_idx` ON `trade_requests` (`requester_id`,`status`,`created_at`);
--> statement-breakpoint
CREATE INDEX `trade_request_offered_status_idx` ON `trade_requests` (`requester_id`,`offered_card_id`,`status`);
--> statement-breakpoint
CREATE UNIQUE INDEX `trade_request_one_pending_listing_idx` ON `trade_requests` (`listing_id`) WHERE `status` = 'PENDING';
