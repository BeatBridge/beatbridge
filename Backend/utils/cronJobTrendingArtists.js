const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cron = require('node-cron');

async function calculateTrendingArtists() {
    const now = new Date();
    const oneDayAgo = new Date(now.setDate(now.getDate() - 1));

    // Fetch tagged songs from the past day
    const recentTags = await prisma.song.findMany({
        where: {
            taggedAt: {
                gte: oneDayAgo
            }
        },
        include: {
            user: true
        }
    });

    const recentSearches = await prisma.artistSearch.findMany({
        where: {
            createdAt: {
                gte: oneDayAgo
            }
        },
        include: {
            artist: true
        }
    });

    // Calculate momentum for each artist
    const artistMomentum = {};

    //Add tagged songs momentum
    for (const tag of recentTags) {
        const artistName = tag.artist;
        if (!artistMomentum[artistName]) {
            artistMomentum[artistName] = {
                tagCount: 0,
                popularity: 0,
                searchCount: 0,
                artistId: null,
            };
        }
        artistMomentum[artistName].tagCount += 1;

        const artist = await prisma.artist.findUnique({
            where: { name: artistName }
        });

        if (artist) {
            artistMomentum[artistName].popularity = artist.popularity;
            artistMomentum[artistName].artistId = artist.id;
        }
    }

    //Add search count momentum
    for (const search of recentSearches) {
        const artistName = search.artist.name;
        if (!artistMomentum[artistName]) {
            artistMomentum[artistName] = {
                tagCount: 0,
                popularity: 0,
                searchCount: 0,
                artistId: search.artist.id,
            };
        }
        artistMomentum[artistName].searchCount += 1;
    }

    // Combine tag count, search count, and popularity to calculate momentum
    const trendingArtists = Object.entries(artistMomentum)
        .map(([name, data]) => ({
            artistId: data.artistId,
            momentum: data.tagCount + data.searchCount + data.popularity * 0.1
        }))
        .sort((a, b) => b.momentum - a.momentum)
        .slice(0, 5); // Top 5 artists

    // Store trending artists in the database
    for (const artist of trendingArtists) {
        if (artist.artistId) {
            await prisma.trendingArtist.create({
                data: {
                    artistId: artist.artistId,
                    momentum: artist.momentum,
                    createdAt: new Date()
                }
            });
        }
    }

    console.log('Trending Artists stored:', trendingArtists);
}

cron.schedule('0 0 * * *', async () => {
    console.log('Cron job started: Calculating trending artists...');
    await calculateTrendingArtists();
    console.log('Cron job completed: Trending artists calculated and stored.');
});
