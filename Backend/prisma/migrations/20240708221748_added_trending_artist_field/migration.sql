-- CreateTable
CREATE TABLE "TrendingArtist" (
    "id" SERIAL NOT NULL,
    "artistId" INTEGER NOT NULL,
    "momentum" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrendingArtist_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TrendingArtist" ADD CONSTRAINT "TrendingArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
