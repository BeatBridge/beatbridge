/*
  Warnings:

  - You are about to drop the `TrackArtist` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TrackArtist" DROP CONSTRAINT "TrackArtist_artistId_fkey";

-- DropForeignKey
ALTER TABLE "TrackArtist" DROP CONSTRAINT "TrackArtist_trackId_fkey";

-- DropTable
DROP TABLE "TrackArtist";

-- CreateTable
CREATE TABLE "_TrackToArtist" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_TrackToArtist_AB_unique" ON "_TrackToArtist"("A", "B");

-- CreateIndex
CREATE INDEX "_TrackToArtist_B_index" ON "_TrackToArtist"("B");

-- AddForeignKey
ALTER TABLE "_TrackToArtist" ADD CONSTRAINT "_TrackToArtist_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TrackToArtist" ADD CONSTRAINT "_TrackToArtist_B_fkey" FOREIGN KEY ("B") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;
