-- CreateTable
CREATE TABLE "GroupExclusion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "groupId" INTEGER NOT NULL,
    "userAId" INTEGER NOT NULL,
    "userBId" INTEGER NOT NULL,
    CONSTRAINT "GroupExclusion_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GroupExclusion_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GroupExclusion_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "groupId" INTEGER NOT NULL,
    "giverId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "viewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Assignment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Assignment_giverId_fkey" FOREIGN KEY ("giverId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Assignment_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupExclusion_groupId_userAId_userBId_key" ON "GroupExclusion"("groupId", "userAId", "userBId");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_groupId_giverId_key" ON "Assignment"("groupId", "giverId");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_groupId_receiverId_key" ON "Assignment"("groupId", "receiverId");
