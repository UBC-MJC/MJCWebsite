-- CreateTable
CREATE TABLE `Player` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `admin` BOOLEAN NOT NULL DEFAULT false,
    `japaneseQualified` BOOLEAN NOT NULL DEFAULT false,
    `hongKongQualified` BOOLEAN NOT NULL DEFAULT false,
    `legacyDisplayGame` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Player_email_key`(`email`),
    UNIQUE INDEX `Player_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JapanesePlayerGame` (
    `id` VARCHAR(191) NOT NULL,
    `wind` ENUM('EAST', 'SOUTH', 'WEST', 'NORTH') NOT NULL,
    `eloChange` DOUBLE NULL,
    `playerId` VARCHAR(191) NOT NULL,
    `gameId` INTEGER NULL,

    INDEX `JapanesePlayerGame_gameId_fkey`(`gameId`),
    INDEX `JapanesePlayerGame_playerId_fkey`(`playerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HongKongPlayerGame` (
    `id` VARCHAR(191) NOT NULL,
    `wind` ENUM('EAST', 'SOUTH', 'WEST', 'NORTH') NOT NULL,
    `eloChange` DOUBLE NULL,
    `playerId` VARCHAR(191) NOT NULL,
    `gameId` INTEGER NULL,

    INDEX `HongKongPlayerGame_gameId_fkey`(`gameId`),
    INDEX `HongKongPlayerGame_playerId_fkey`(`playerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Season` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endDate` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JapaneseGame` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `seasonId` VARCHAR(191) NOT NULL,
    `status` ENUM('IN_PROGRESS', 'FINISHED') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endedAt` DATETIME(3) NULL,
    `recordedById` VARCHAR(191) NOT NULL,
    `type` ENUM('RANKED', 'PLAY_OFF', 'TOURNEY') NOT NULL,

    INDEX `JapaneseGame_recordedById_fkey`(`recordedById`),
    INDEX `JapaneseGame_seasonId_fkey`(`seasonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JapaneseRound` (
    `id` VARCHAR(191) NOT NULL,
    `roundCount` INTEGER NOT NULL,
    `roundWind` ENUM('EAST', 'SOUTH', 'WEST', 'NORTH') NOT NULL,
    `roundNumber` INTEGER NOT NULL,
    `bonus` INTEGER NOT NULL,
    `gameId` INTEGER NOT NULL,
    `endRiichiStickCount` INTEGER NOT NULL,
    `player0Riichi` BOOLEAN NOT NULL DEFAULT false,
    `player0Tenpai` BOOLEAN NOT NULL DEFAULT false,
    `player1Riichi` BOOLEAN NOT NULL DEFAULT false,
    `player1Tenpai` BOOLEAN NOT NULL DEFAULT false,
    `player2Riichi` BOOLEAN NOT NULL DEFAULT false,
    `player2Tenpai` BOOLEAN NOT NULL DEFAULT false,
    `player3Riichi` BOOLEAN NOT NULL DEFAULT false,
    `player3Tenpai` BOOLEAN NOT NULL DEFAULT false,
    `startRiichiStickCount` INTEGER NOT NULL,

    INDEX `JapaneseRound_gameId_fkey`(`gameId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JapaneseTransaction` (
    `id` VARCHAR(191) NOT NULL,
    `transactionType` ENUM('DEAL_IN', 'SELF_DRAW', 'DEAL_IN_PAO', 'SELF_DRAW_PAO', 'NAGASHI_MANGAN', 'INROUND_RYUUKYOKU') NOT NULL,
    `player0ScoreChange` INTEGER NOT NULL DEFAULT 0,
    `player1ScoreChange` INTEGER NOT NULL DEFAULT 0,
    `player2ScoreChange` INTEGER NOT NULL DEFAULT 0,
    `player3ScoreChange` INTEGER NOT NULL DEFAULT 0,
    `han` INTEGER NULL,
    `fu` INTEGER NULL,
    `dora` INTEGER NULL,
    `paoPlayerIndex` INTEGER NULL,
    `roundId` VARCHAR(191) NOT NULL,

    INDEX `JapaneseTransaction_roundId_fkey`(`roundId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HongKongGame` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `seasonId` VARCHAR(191) NOT NULL,
    `status` ENUM('IN_PROGRESS', 'FINISHED') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endedAt` DATETIME(3) NULL,
    `recordedById` VARCHAR(191) NOT NULL,
    `type` ENUM('RANKED', 'PLAY_OFF', 'TOURNEY') NOT NULL,

    INDEX `HongKongGame_recordedById_fkey`(`recordedById`),
    INDEX `HongKongGame_seasonId_fkey`(`seasonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HongKongRound` (
    `id` VARCHAR(191) NOT NULL,
    `roundCount` INTEGER NOT NULL,
    `roundWind` ENUM('EAST', 'SOUTH', 'WEST', 'NORTH') NOT NULL,
    `roundNumber` INTEGER NOT NULL,
    `gameId` INTEGER NOT NULL,

    INDEX `HongKongRound_gameId_fkey`(`gameId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HongKongTransaction` (
    `id` VARCHAR(191) NOT NULL,
    `transactionType` ENUM('DEAL_IN', 'SELF_DRAW', 'DEAL_IN_PAO', 'SELF_DRAW_PAO') NOT NULL,
    `player0ScoreChange` INTEGER NOT NULL DEFAULT 0,
    `player1ScoreChange` INTEGER NOT NULL DEFAULT 0,
    `player2ScoreChange` INTEGER NOT NULL DEFAULT 0,
    `player3ScoreChange` INTEGER NOT NULL DEFAULT 0,
    `hand` INTEGER NULL,
    `roundId` VARCHAR(191) NOT NULL,

    INDEX `HongKongTransaction_roundId_fkey`(`roundId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `JapanesePlayerGame` ADD CONSTRAINT `JapanesePlayerGame_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `JapaneseGame`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JapanesePlayerGame` ADD CONSTRAINT `JapanesePlayerGame_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `Player`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HongKongPlayerGame` ADD CONSTRAINT `HongKongPlayerGame_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `HongKongGame`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HongKongPlayerGame` ADD CONSTRAINT `HongKongPlayerGame_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `Player`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JapaneseGame` ADD CONSTRAINT `JapaneseGame_recordedById_fkey` FOREIGN KEY (`recordedById`) REFERENCES `Player`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JapaneseGame` ADD CONSTRAINT `JapaneseGame_seasonId_fkey` FOREIGN KEY (`seasonId`) REFERENCES `Season`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JapaneseRound` ADD CONSTRAINT `JapaneseRound_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `JapaneseGame`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JapaneseTransaction` ADD CONSTRAINT `JapaneseTransaction_roundId_fkey` FOREIGN KEY (`roundId`) REFERENCES `JapaneseRound`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HongKongGame` ADD CONSTRAINT `HongKongGame_recordedById_fkey` FOREIGN KEY (`recordedById`) REFERENCES `Player`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HongKongGame` ADD CONSTRAINT `HongKongGame_seasonId_fkey` FOREIGN KEY (`seasonId`) REFERENCES `Season`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HongKongRound` ADD CONSTRAINT `HongKongRound_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `HongKongGame`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HongKongTransaction` ADD CONSTRAINT `HongKongTransaction_roundId_fkey` FOREIGN KEY (`roundId`) REFERENCES `HongKongRound`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
