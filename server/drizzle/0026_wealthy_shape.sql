CREATE TABLE `nav_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`label` varchar(100) NOT NULL,
	`url` varchar(255) NOT NULL DEFAULT '',
	`sort_order` int NOT NULL DEFAULT 0,
	`is_visible` boolean NOT NULL DEFAULT true,
	CONSTRAINT `nav_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nav_subitems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nav_item_id` int NOT NULL,
	`label` varchar(100) NOT NULL,
	`url` varchar(255) NOT NULL DEFAULT '',
	`sort_order` int NOT NULL DEFAULT 0,
	`is_visible` boolean NOT NULL DEFAULT true,
	CONSTRAINT `nav_subitems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `nav_subitems` ADD CONSTRAINT `nav_subitems_nav_item_id_nav_items_id_fk` FOREIGN KEY (`nav_item_id`) REFERENCES `nav_items`(`id`) ON DELETE cascade ON UPDATE no action;