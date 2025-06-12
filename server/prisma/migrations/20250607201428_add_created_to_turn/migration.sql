-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BinokelTurn" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "turnNumber" INTEGER NOT NULL,
    "roundId" INTEGER NOT NULL,
    "trickWinnerUuid" TEXT,
    "pointsWon" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BinokelTurn_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "BinokelRound" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BinokelTurn_trickWinnerUuid_fkey" FOREIGN KEY ("trickWinnerUuid") REFERENCES "User" ("uuid") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_BinokelTurn" ("id", "pointsWon", "roundId", "trickWinnerUuid", "turnNumber") SELECT "id", "pointsWon", "roundId", "trickWinnerUuid", "turnNumber" FROM "BinokelTurn";
DROP TABLE "BinokelTurn";
ALTER TABLE "new_BinokelTurn" RENAME TO "BinokelTurn";
CREATE UNIQUE INDEX "BinokelTurn_roundId_turnNumber_key" ON "BinokelTurn"("roundId", "turnNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
