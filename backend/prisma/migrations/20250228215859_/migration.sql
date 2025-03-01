-- CreateTable
CREATE TABLE "Upvote" (
    "id" TEXT NOT NULL,
    "studentSessionId" TEXT NOT NULL,
    "studentQuestionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Upvote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Upvote_studentSessionId_studentQuestionId_key" ON "Upvote"("studentSessionId", "studentQuestionId");

-- AddForeignKey
ALTER TABLE "Upvote" ADD CONSTRAINT "Upvote_studentSessionId_fkey" FOREIGN KEY ("studentSessionId") REFERENCES "StudentSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upvote" ADD CONSTRAINT "Upvote_studentQuestionId_fkey" FOREIGN KEY ("studentQuestionId") REFERENCES "StudentQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
