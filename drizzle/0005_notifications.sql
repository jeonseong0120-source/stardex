CREATE TABLE `notifications` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `type` text NOT NULL,
  `title` text NOT NULL,
  `body` text NOT NULL,
  `card_id` text,
  `related_id` text,
  `data_json` text DEFAULT '{}' NOT NULL,
  `read_at` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `notification_user_read_created_idx` ON `notifications` (`user_id`,`read_at`,`created_at`);
