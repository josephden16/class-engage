/*
  Warnings:

  - You are about to drop the column `status` on the `LiveSession` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LiveSession" DROP COLUMN "status",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
