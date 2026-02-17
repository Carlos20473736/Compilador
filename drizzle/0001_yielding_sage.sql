CREATE TABLE `builds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectName` varchar(255),
	`buildType` enum('debug','release') NOT NULL,
	`status` enum('pending','validating','compiling','success','failed') NOT NULL DEFAULT 'pending',
	`zipFileKey` text,
	`apkFileKey` text,
	`apkUrl` text,
	`logs` text,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `builds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `builds` ADD CONSTRAINT `builds_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;