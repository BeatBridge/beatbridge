-- CreateTable
CREATE TABLE "ArtistSearch" (
    "id" SERIAL NOT NULL,
    "artistId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArtistSearch_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ArtistSearch" ADD CONSTRAINT "ArtistSearch_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
