-- DropForeignKey
ALTER TABLE `JapanesePlayerGame` DROP FOREIGN KEY `JapanesePlayerGame_gameId_fkey`;

-- AlterTable
ALTER TABLE `HongKongGame` MODIFY `type` ENUM('RANKED', 'PLAY_OFF', 'TOURNEY', 'CASUAL') NOT NULL;

-- AlterTable
ALTER TABLE `JapaneseGame` MODIFY `type` ENUM('RANKED', 'PLAY_OFF', 'TOURNEY', 'CASUAL') NOT NULL;

-- AddForeignKey
ALTER TABLE `JapanesePlayerGame` ADD CONSTRAINT `JapanesePlayerGame_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `JapaneseGame`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
