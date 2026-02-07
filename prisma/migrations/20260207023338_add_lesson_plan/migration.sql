-- CreateTable
CREATE TABLE "LessonPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boardId" TEXT NOT NULL,
    "agendaEntryId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "periodMinutes" INTEGER NOT NULL,
    "content" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "LessonPlan_boardId_idx" ON "LessonPlan"("boardId");

-- CreateIndex
CREATE INDEX "LessonPlan_boardId_agendaEntryId_idx" ON "LessonPlan"("boardId", "agendaEntryId");
