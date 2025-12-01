-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PLAYER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TournamentFormat" AS ENUM ('ROUND_ROBIN', 'SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'GROUP_STAGE_ELIMINATION');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'ENDED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "Role" NOT NULL DEFAULT 'PLAYER',
    "favoriteGameId" INTEGER,
    "teamId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "abbr" TEXT NOT NULL,
    "modeType" TEXT NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameMap" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,

    CONSTRAINT "GameMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "tag" TEXT,
    "captainId" INTEGER NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "gameId" INTEGER NOT NULL,
    "format" "TournamentFormat" NOT NULL,
    "maxTeams" INTEGER NOT NULL,
    "championId" INTEGER,
    "status" "TournamentStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentOnTeams" (
    "teamId" INTEGER NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentOnTeams_pkey" PRIMARY KEY ("teamId","tournamentId")
);

-- CreateTable
CREATE TABLE "BracketPosition" (
    "id" SERIAL NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,
    "slotType" TEXT NOT NULL,
    "sourceMatchId" INTEGER NOT NULL,
    "sourceOutcome" TEXT NOT NULL,

    CONSTRAINT "BracketPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "mapId" INTEGER NOT NULL,
    "teamAId" INTEGER,
    "teamBId" INTEGER,
    "winnerId" INTEGER,
    "scoreA" INTEGER,
    "scoreB" INTEGER,
    "played" BOOLEAN NOT NULL DEFAULT false,
    "round" INTEGER NOT NULL,
    "stage" TEXT,
    "groupName" TEXT,
    "bracket" TEXT,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Game_name_key" ON "Game"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Game_abbr_key" ON "Game"("abbr");

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");

-- CreateIndex
CREATE INDEX "BracketPosition_tournamentId_idx" ON "BracketPosition"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "BracketPosition_matchId_slotType_key" ON "BracketPosition"("matchId", "slotType");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_favoriteGameId_fkey" FOREIGN KEY ("favoriteGameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameMap" ADD CONSTRAINT "GameMap_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_championId_fkey" FOREIGN KEY ("championId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentOnTeams" ADD CONSTRAINT "TournamentOnTeams_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentOnTeams" ADD CONSTRAINT "TournamentOnTeams_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BracketPosition" ADD CONSTRAINT "BracketPosition_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BracketPosition" ADD CONSTRAINT "BracketPosition_sourceMatchId_fkey" FOREIGN KEY ("sourceMatchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "GameMap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamAId_fkey" FOREIGN KEY ("teamAId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamBId_fkey" FOREIGN KEY ("teamBId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
