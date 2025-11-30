-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `role` ENUM('PLAYER', 'ADMIN') NOT NULL DEFAULT 'PLAYER',
    `favoriteGameId` INTEGER NULL,
    `teamId` INTEGER NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Game` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `abbr` VARCHAR(191) NOT NULL,
    `modeType` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Game_name_key`(`name`),
    UNIQUE INDEX `Game_abbr_key`(`abbr`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameMap` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `gameId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Team` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `tag` VARCHAR(191) NULL,
    `captainId` INTEGER NOT NULL,

    UNIQUE INDEX `Team_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tournament` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `gameId` INTEGER NOT NULL,
    `format` ENUM('ROUND_ROBIN', 'SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'GROUP_STAGE_ELIMINATION') NOT NULL,
    `maxTeams` INTEGER NOT NULL,
    `championId` INTEGER NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'ENDED') NOT NULL DEFAULT 'PENDING',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TournamentOnTeams` (
    `teamId` INTEGER NOT NULL,
    `tournamentId` INTEGER NOT NULL,
    `registeredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`teamId`, `tournamentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BracketPosition` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournamentId` INTEGER NOT NULL,
    `matchId` INTEGER NOT NULL,
    `slotType` VARCHAR(191) NOT NULL,
    `sourceMatchId` INTEGER NOT NULL,
    `sourceOutcome` VARCHAR(191) NOT NULL,

    INDEX `BracketPosition_tournamentId_idx`(`tournamentId`),
    UNIQUE INDEX `BracketPosition_matchId_slotType_key`(`matchId`, `slotType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Match` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournamentId` INTEGER NOT NULL,
    `mapId` INTEGER NOT NULL,
    `teamAId` INTEGER NULL,
    `teamBId` INTEGER NULL,
    `winnerId` INTEGER NULL,
    `scoreA` INTEGER NULL,
    `scoreB` INTEGER NULL,
    `played` BOOLEAN NOT NULL DEFAULT false,
    `round` INTEGER NOT NULL,
    `stage` VARCHAR(191) NULL,
    `groupName` VARCHAR(191) NULL,
    `bracket` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_favoriteGameId_fkey` FOREIGN KEY (`favoriteGameId`) REFERENCES `Game`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameMap` ADD CONSTRAINT `GameMap_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_captainId_fkey` FOREIGN KEY (`captainId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tournament` ADD CONSTRAINT `Tournament_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tournament` ADD CONSTRAINT `Tournament_championId_fkey` FOREIGN KEY (`championId`) REFERENCES `Team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TournamentOnTeams` ADD CONSTRAINT `TournamentOnTeams_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TournamentOnTeams` ADD CONSTRAINT `TournamentOnTeams_tournamentId_fkey` FOREIGN KEY (`tournamentId`) REFERENCES `Tournament`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BracketPosition` ADD CONSTRAINT `BracketPosition_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BracketPosition` ADD CONSTRAINT `BracketPosition_sourceMatchId_fkey` FOREIGN KEY (`sourceMatchId`) REFERENCES `Match`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_tournamentId_fkey` FOREIGN KEY (`tournamentId`) REFERENCES `Tournament`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_mapId_fkey` FOREIGN KEY (`mapId`) REFERENCES `GameMap`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_teamAId_fkey` FOREIGN KEY (`teamAId`) REFERENCES `Team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_teamBId_fkey` FOREIGN KEY (`teamBId`) REFERENCES `Team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_winnerId_fkey` FOREIGN KEY (`winnerId`) REFERENCES `Team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
