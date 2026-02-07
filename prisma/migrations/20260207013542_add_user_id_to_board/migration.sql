-- CreateTable
CREATE TABLE "Board" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL DEFAULT 'Untitled Board',
    "slug" TEXT NOT NULL,
    "liveblocksRoom" TEXT NOT NULL,
    "userId" TEXT,
    "state" TEXT,
    "gradeLevel" TEXT,
    "subjects" TEXT,
    "location" TEXT,
    "content" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StandardSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "state" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "gradeLevel" TEXT NOT NULL,
    "framework" TEXT
);

-- CreateTable
CREATE TABLE "Standard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "standardSetId" TEXT NOT NULL,
    CONSTRAINT "Standard_standardSetId_fkey" FOREIGN KEY ("standardSetId") REFERENCES "StandardSet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AiInteraction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boardId" TEXT NOT NULL,
    "cellId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "tokenCount" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Board_slug_key" ON "Board"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Board_liveblocksRoom_key" ON "Board"("liveblocksRoom");

-- CreateIndex
CREATE UNIQUE INDEX "StandardSet_state_subject_gradeLevel_key" ON "StandardSet"("state", "subject", "gradeLevel");
