/*
  Warnings:

  - You are about to drop the column `upvotes` on the `Question` table. All the data in the column will be lost.
  - The `options` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "QuestionType" ADD VALUE 'TRUE_FALSE';
ALTER TYPE "QuestionType" ADD VALUE 'FORMULA';

-- AlterTable
ALTER TABLE "LiveSession" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "upvotes",
ADD COLUMN     "timeLimit" INTEGER NOT NULL DEFAULT 60,
DROP COLUMN "options",
ADD COLUMN     "options" TEXT[];

-- CreateTable
CREATE TABLE "StudentQuestion" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "studentSessionId" TEXT,
    "text" TEXT NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "answeredBy" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentQuestion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StudentQuestion" ADD CONSTRAINT "StudentQuestion_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentQuestion" ADD CONSTRAINT "StudentQuestion_studentSessionId_fkey" FOREIGN KEY ("studentSessionId") REFERENCES "StudentSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
