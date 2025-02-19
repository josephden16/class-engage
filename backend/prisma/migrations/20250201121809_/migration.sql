/*
  Warnings:

  - Made the column `customer_name` on table `reviews` required. This step will fail if there are existing NULL values in that column.
  - Made the column `customer_email` on table `reviews` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "reviews" ALTER COLUMN "customer_name" SET NOT NULL,
ALTER COLUMN "customer_email" SET NOT NULL;
