/*
  Warnings:

  - Added the required column `updatedAt` to the `BinokelMeld` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BinokelMeld" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "points" INTEGER NOT NULL,
    "roundId" INTEGER NOT NULL,
    "userUuid" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BinokelMeld_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "BinokelRound" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BinokelMeld_userUuid_fkey" FOREIGN KEY ("userUuid") REFERENCES "User" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BinokelMeld" ("id", "points", "roundId", "userUuid") SELECT "id", "points", "roundId", "userUuid" FROM "BinokelMeld";
DROP TABLE "BinokelMeld";
ALTER TABLE "new_BinokelMeld" RENAME TO "BinokelMeld";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
