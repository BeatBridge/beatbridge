/*
  Warnings:

  - You are about to drop the `_ArtistToTrack` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ArtistToTrack" DROP CONSTRAINT "_ArtistToTrack_A_fkey";

-- DropForeignKey
ALTER TABLE "_ArtistToTrack" DROP CONSTRAINT "_ArtistToTrack_B_fkey";

-- DropTable
DROP TABLE "_ArtistToTrack";

-- CreateTable
CREATE TABLE "TrackArtist" (
    "trackId" INTEGER NOT NULL,
    "artistId" INTEGER NOT NULL,

    CONSTRAINT "TrackArtist_pkey" PRIMARY KEY ("trackId","artistId")
);

-- AddForeignKey
ALTER TABLE "TrackArtist" ADD CONSTRAINT "TrackArtist_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackArtist" ADD CONSTRAINT "TrackArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
