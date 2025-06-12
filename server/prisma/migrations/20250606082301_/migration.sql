-- CreateTable
CREATE TABLE "BinokelGame" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "pin" TEXT NOT NULL,
    "password" TEXT,
    "activeSince" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maxPlayer" INTEGER NOT NULL DEFAULT 3,
    "ruleId" INTEGER NOT NULL,
    "activeRoundId" INTEGER,
    CONSTRAINT "BinokelGame_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "BinokelRule" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BinokelGame_activeRoundId_fkey" FOREIGN KEY ("activeRoundId") REFERENCES "BinokelRound" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BinokelRule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "global" BOOLEAN NOT NULL DEFAULT false,
    "rounds" INTEGER NOT NULL DEFAULT 1,
    "deck" TEXT NOT NULL DEFAULT 'WUERTTEMBERGISCH'
);

-- CreateTable
CREATE TABLE "BinokelRound" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "roundNumber" INTEGER NOT NULL,
    "trump" TEXT,
    "state" TEXT NOT NULL DEFAULT 'WAITING_FOR_PLAYERS',
    "dealerUuid" TEXT,
    "gameUuid" TEXT NOT NULL,
    "reizValue" INTEGER,
    "reizWinnerUuid" TEXT,
    CONSTRAINT "BinokelRound_dealerUuid_fkey" FOREIGN KEY ("dealerUuid") REFERENCES "User" ("uuid") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "BinokelRound_gameUuid_fkey" FOREIGN KEY ("gameUuid") REFERENCES "BinokelGame" ("uuid") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BinokelRound_reizWinnerUuid_fkey" FOREIGN KEY ("reizWinnerUuid") REFERENCES "User" ("uuid") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BinokelTurn" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "turnNumber" INTEGER NOT NULL,
    "roundId" INTEGER NOT NULL,
    "trickWinnerUuid" TEXT,
    "pointsWon" INTEGER,
    CONSTRAINT "BinokelTurn_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "BinokelRound" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BinokelTurn_trickWinnerUuid_fkey" FOREIGN KEY ("trickWinnerUuid") REFERENCES "User" ("uuid") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BinokelReizAction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "roundId" INTEGER NOT NULL,
    "playerUuid" TEXT NOT NULL,
    "bidValue" INTEGER,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BinokelReizAction_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "BinokelRound" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BinokelReizAction_playerUuid_fkey" FOREIGN KEY ("playerUuid") REFERENCES "User" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BinokelMeld" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "points" INTEGER NOT NULL,
    "roundId" INTEGER NOT NULL,
    "userUuid" TEXT NOT NULL,
    CONSTRAINT "BinokelMeld_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "BinokelRound" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BinokelMeld_userUuid_fkey" FOREIGN KEY ("userUuid") REFERENCES "User" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BinokelCardOwnedByPlayer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "copy" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "cardId" INTEGER NOT NULL,
    "roundId" INTEGER NOT NULL,
    "playerUuid" TEXT NOT NULL,
    "meldId" INTEGER,
    CONSTRAINT "BinokelCardOwnedByPlayer_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BinokelCardOwnedByPlayer_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "BinokelRound" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BinokelCardOwnedByPlayer_playerUuid_fkey" FOREIGN KEY ("playerUuid") REFERENCES "User" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BinokelCardOwnedByPlayer_meldId_fkey" FOREIGN KEY ("meldId") REFERENCES "BinokelMeld" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Card" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "suit" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "points" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "socketId" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "coins" INTEGER NOT NULL DEFAULT 100000,
    "activeGameId" TEXT,
    CONSTRAINT "User_activeGameId_fkey" FOREIGN KEY ("activeGameId") REFERENCES "BinokelGame" ("uuid") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BinokelGame_pin_key" ON "BinokelGame"("pin");

-- CreateIndex
CREATE UNIQUE INDEX "BinokelGame_activeRoundId_key" ON "BinokelGame"("activeRoundId");

-- CreateIndex
CREATE INDEX "BinokelGame_pin_idx" ON "BinokelGame"("pin");

-- CreateIndex
CREATE UNIQUE INDEX "BinokelRound_gameUuid_roundNumber_key" ON "BinokelRound"("gameUuid", "roundNumber");

-- CreateIndex
CREATE UNIQUE INDEX "BinokelTurn_roundId_turnNumber_key" ON "BinokelTurn"("roundId", "turnNumber");

-- CreateIndex
CREATE INDEX "BinokelReizAction_roundId_playerUuid_bidValue_passed_idx" ON "BinokelReizAction"("roundId", "playerUuid", "bidValue", "passed");

-- CreateIndex
CREATE UNIQUE INDEX "BinokelCardOwnedByPlayer_meldId_key" ON "BinokelCardOwnedByPlayer"("meldId");

-- CreateIndex
CREATE UNIQUE INDEX "BinokelCardOwnedByPlayer_roundId_cardId_copy_key" ON "BinokelCardOwnedByPlayer"("roundId", "cardId", "copy");

-- CreateIndex
CREATE UNIQUE INDEX "Card_suit_rank_key" ON "Card"("suit", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_socketId_key" ON "User"("socketId");
