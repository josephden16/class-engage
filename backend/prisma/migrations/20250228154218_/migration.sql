/*
  Warnings:

  - You are about to drop the column `answeredBy` on the `StudentQuestion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StudentQuestion" DROP COLUMN "answeredBy",
ADD COLUMN     "isAnswered" BOOLEAN NOT NULL DEFAULT false;
