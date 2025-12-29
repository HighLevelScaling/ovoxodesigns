CREATE TABLE `brandKits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`logoId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`emailSignatureUrl` text,
	`emailSignatureKey` varchar(500),
	`businessCardFrontUrl` text,
	`businessCardFrontKey` varchar(500),
	`businessCardBackUrl` text,
	`businessCardBackKey` varchar(500),
	`letterheadUrl` text,
	`letterheadKey` varchar(500),
	`folderUrl` text,
	`folderKey` varchar(500),
	`status` enum('pending','generating','completed','failed') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brandKits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `logoGenerations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`logoId` int,
	`purchaseId` int,
	`prompt` text NOT NULL,
	`apiResponse` json,
	`status` enum('pending','processing','completed','failed') DEFAULT 'pending',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `logoGenerations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `logos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`tagline` varchar(500),
	`industry` varchar(100),
	`style` varchar(100),
	`colorScheme` varchar(100),
	`prompt` text,
	`imageUrl` text,
	`imageKey` varchar(500),
	`thumbnailUrl` text,
	`format` enum('png','jpeg') DEFAULT 'png',
	`hasTransparentBg` int DEFAULT 1,
	`variationIndex` int DEFAULT 0,
	`parentLogoId` int,
	`status` enum('pending','generating','completed','failed') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `logos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`packageType` enum('basic','premium','brandkit') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) DEFAULT 'USD',
	`stripePaymentIntentId` varchar(255),
	`stripeSessionId` varchar(255),
	`status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
	`logoId` int,
	`brandKitId` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchases_id` PRIMARY KEY(`id`)
);
