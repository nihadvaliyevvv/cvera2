-- CreateTable
CREATE TABLE `ApiKey_temp` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `service` VARCHAR(191) NOT NULL DEFAULT 'linkedin',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `usageCount` INTEGER NOT NULL DEFAULT 0,
    `lastUsed` DATETIME(3) NULL,
    `lastResult` VARCHAR(191) NULL,
    `deactivatedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ApiKey_temp_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Copy data from old table to new table
INSERT INTO `ApiKey_temp` (`id`, `name`, `key`, `service`, `active`, `priority`, `usageCount`, `lastUsed`, `lastResult`, `createdAt`, `updatedAt`)
SELECT `id`, `name`, `key`, `service`, `active`, `priority`, `usageCount`, `lastUsed`, `lastResult`, `createdAt`, `updatedAt` FROM `ApiKey`;

-- Drop old table
DROP TABLE `ApiKey`;

-- Rename new table
ALTER TABLE `ApiKey_temp` RENAME TO `ApiKey`;
