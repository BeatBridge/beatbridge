const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cron = require('node-cron');

async function calculateTrendingArtists() {
    const now = new Date();
    const oneDayAgo = new Date(now.setDate(now.getDate() - 1));

    // Clear the existing trending artists
    await prisma.trendingArtist.deleteMany({});

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

    // Fetch artist searches from the past day
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

    // Add tagged songs momentum
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

        const artist = await prisma.artist.findFirst({
            where: { name: artistName }
        });

        if (artist) {
            artistMomentum[artistName].popularity = artist.popularity;
            artistMomentum[artistName].artistId = artist.id;
        }
    }

    // Add search count momentum
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

    // Store trending artists in the database without duplicates
    const uniqueArtistIds = new Set();
    for (const artist of trendingArtists) {
        if (artist.artistId && !uniqueArtistIds.has(artist.artistId)) {
            await prisma.trendingArtist.create({
                data: {
                    artistId: artist.artistId,
                    momentum: artist.momentum,
                    createdAt: new Date()
                }
            });
            uniqueArtistIds.add(artist.artistId);
        }
    }

    console.log('Trending Artists stored:', trendingArtists);
}

// Schedule a cron job to calculate trending artists every day at midnight
cron.schedule('0 0 * * *', async () => {
    //TODO: cleanup
    console.log('Cron job started: Calculating trending artists...');
    await calculateTrendingArtists();
    //TODO: cleanup
    console.log('Cron job completed: Trending artists calculated and stored.');
});

// (async () => {
//     console.log('Initial run: Calculating trending artists...');
//     await calculateTrendingArtists();
//     console.log('Initial run completed: Trending artists calculated and stored.');
// })();
