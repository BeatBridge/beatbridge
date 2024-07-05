/*
  Warnings:

  - You are about to drop the column `topArtists` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `topTracks` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "topArtists",
DROP COLUMN "topTracks";

-- CreateTable
CREATE TABLE "Song" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "album" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "mood" TEXT,
    "tempo" TEXT,
    "customTags" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
