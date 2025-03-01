/*
  Warnings:

  - You are about to drop the column `invitationCode` on the `Course` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[invitationCode]` on the table `LiveSession` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `courseCode` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invitationCode` to the `LiveSession` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Course_invitationCode_key";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "invitationCode",
ADD COLUMN     "courseCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LiveSession" ADD COLUMN     "invitationCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "LiveSession_invitationCode_key" ON "LiveSession"("invitationCode");
