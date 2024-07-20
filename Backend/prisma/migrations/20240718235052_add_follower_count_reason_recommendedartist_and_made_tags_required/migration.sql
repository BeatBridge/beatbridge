/*
  Warnings:

  - Made the column `mood` on table `Song` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tempo` on table `Song` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Song" ALTER COLUMN "mood" SET NOT NULL,
ALTER COLUMN "tempo" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "recommendedArtist" TEXT;
