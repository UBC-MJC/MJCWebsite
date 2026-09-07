-- Collect every game type used by each legacy season across both variants.
CREATE TEMPORARY TABLE `_SeasonGameType` (
    `seasonId` VARCHAR(191) NOT NULL,
    `type` ENUM('RANKED', 'PLAY_OFF', 'TOURNEY', 'CASUAL') NOT NULL,
    PRIMARY KEY (`seasonId`, `type`)
);

INSERT IGNORE INTO `_SeasonGameType` (`seasonId`, `type`)
SELECT `seasonId`, `type` FROM `JapaneseGame`;

INSERT IGNORE INTO `_SeasonGameType` (`seasonId`, `type`)
SELECT `seasonId`, `type` FROM `HongKongGame`;

-- Prefer to keep ranked games attached to the original season. For seasons
-- without ranked games, keep one of their existing types on the original row.
CREATE TEMPORARY TABLE `_SeasonPrimaryType` AS
SELECT
    `seasonId`,
    CASE
        WHEN SUM(`type` = 'RANKED') > 0 THEN 'RANKED'
        ELSE MIN(`type`)
    END AS `type`
FROM `_SeasonGameType`
GROUP BY `seasonId`;

UPDATE `Season` AS `season`
INNER JOIN `_SeasonPrimaryType` AS `primaryType`
    ON `primaryType`.`seasonId` = `season`.`id`
SET `season`.`type` = `primaryType`.`type`;

-- Map every additional type to a deterministic cloned season.
CREATE TEMPORARY TABLE `_SeasonTypeMap` AS
SELECT
    `gameType`.`seasonId` AS `oldSeasonId`,
    `gameType`.`type`,
    CASE
        WHEN `gameType`.`type` = `primaryType`.`type` THEN `gameType`.`seasonId`
        ELSE CONCAT('split_', MD5(CONCAT(`gameType`.`seasonId`, ':', `gameType`.`type`)))
    END AS `newSeasonId`
FROM `_SeasonGameType` AS `gameType`
INNER JOIN `_SeasonPrimaryType` AS `primaryType`
    ON `primaryType`.`seasonId` = `gameType`.`seasonId`;

INSERT INTO `Season` (`id`, `name`, `type`, `startDate`, `endDate`)
SELECT
    `mapping`.`newSeasonId`,
    `season`.`name`,
    `mapping`.`type`,
    `season`.`startDate`,
    `season`.`endDate`
FROM `_SeasonTypeMap` AS `mapping`
INNER JOIN `Season` AS `season`
    ON `season`.`id` = `mapping`.`oldSeasonId`
WHERE `mapping`.`newSeasonId` <> `mapping`.`oldSeasonId`;

UPDATE `JapaneseGame` AS `game`
INNER JOIN `_SeasonTypeMap` AS `mapping`
    ON `mapping`.`oldSeasonId` = `game`.`seasonId`
    AND `mapping`.`type` = `game`.`type`
SET `game`.`seasonId` = `mapping`.`newSeasonId`;

UPDATE `HongKongGame` AS `game`
INNER JOIN `_SeasonTypeMap` AS `mapping`
    ON `mapping`.`oldSeasonId` = `game`.`seasonId`
    AND `mapping`.`type` = `game`.`type`
SET `game`.`seasonId` = `mapping`.`newSeasonId`;

DROP TEMPORARY TABLE `_SeasonTypeMap`;
DROP TEMPORARY TABLE `_SeasonPrimaryType`;
DROP TEMPORARY TABLE `_SeasonGameType`;

-- Game type is now owned exclusively by the season container.
ALTER TABLE `JapaneseGame` DROP COLUMN `type`;
ALTER TABLE `HongKongGame` DROP COLUMN `type`;
