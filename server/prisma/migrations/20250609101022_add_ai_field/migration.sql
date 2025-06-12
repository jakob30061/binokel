-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "socketId" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "coins" INTEGER NOT NULL DEFAULT 100000,
    "isAI" BOOLEAN NOT NULL DEFAULT false,
    "activeGameId" TEXT,
    CONSTRAINT "User_activeGameId_fkey" FOREIGN KEY ("activeGameId") REFERENCES "BinokelGame" ("uuid") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("activeGameId", "coins", "language", "socketId", "uuid") SELECT "activeGameId", "coins", "language", "socketId", "uuid" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");
CREATE UNIQUE INDEX "User_socketId_key" ON "User"("socketId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
