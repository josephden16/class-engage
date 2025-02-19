/*
  Warnings:

  - Made the column `company_name` on table `user_profiles` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user_profiles" ALTER COLUMN "company_name" SET NOT NULL;
