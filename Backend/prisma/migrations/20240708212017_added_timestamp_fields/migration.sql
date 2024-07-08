-- AlterTable
ALTER TABLE "Artist" ADD COLUMN     "popularity" INTEGER;

-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "taggedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
