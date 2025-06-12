/*
  Warnings:

  - You are about to drop the column `state` on the `BinokelCardOwnedByPlayer` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BinokelCardOwnedByPlayer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "copy" TEXT NOT NULL,
    "cardId" INTEGER NOT NULL,
    "roundId" INTEGER NOT NULL,
    "playerUuid" TEXT NOT NULL,
    "turnId" INTEGER,
    "meldId" INTEGER,
    "playedAt" DATETIME,
    CONSTRAINT "BinokelCardOwnedByPlayer_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BinokelCardOwnedByPlayer_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "BinokelRound" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BinokelCardOwnedByPlayer_playerUuid_fkey" FOREIGN KEY ("playerUuid") REFERENCES "User" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BinokelCardOwnedByPlayer_turnId_fkey" FOREIGN KEY ("turnId") REFERENCES "BinokelTurn" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "BinokelCardOwnedByPlayer_meldId_fkey" FOREIGN KEY ("meldId") REFERENCES "BinokelMeld" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_BinokelCardOwnedByPlayer" ("cardId", "copy", "id", "meldId", "playedAt", "playerUuid", "roundId", "turnId") SELECT "cardId", "copy", "id", "meldId", "playedAt", "playerUuid", "roundId", "turnId" FROM "BinokelCardOwnedByPlayer";
DROP TABLE "BinokelCardOwnedByPlayer";
ALTER TABLE "new_BinokelCardOwnedByPlayer" RENAME TO "BinokelCardOwnedByPlayer";
CREATE UNIQUE INDEX "BinokelCardOwnedByPlayer_roundId_cardId_copy_key" ON "BinokelCardOwnedByPlayer"("roundId", "cardId", "copy");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
