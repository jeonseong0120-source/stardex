CREATE TABLE `user_collection_states` (
	`user_id` text PRIMARY KEY NOT NULL,
	`coin` integer DEFAULT 3000 NOT NULL,
	`showcase_json` text DEFAULT '[]' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
