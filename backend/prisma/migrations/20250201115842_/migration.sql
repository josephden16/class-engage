-- AlterTable
ALTER TABLE "reviews" ALTER COLUMN "comment" SET DEFAULT '';

-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "google_place_id" TEXT;
