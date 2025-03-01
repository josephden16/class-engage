/*
  Warnings:

  - Added the required column `lecturerId` to the `LiveSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LiveSession" ADD COLUMN     "lecturerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "LiveSession" ADD CONSTRAINT "LiveSession_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
