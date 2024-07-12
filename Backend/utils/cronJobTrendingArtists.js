const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cron = require('node-cron');

async function calculateTrendingArtists() {
    const now = new Date();
    const oneDayAgo = new Date(now.setDate(now.getDate() - 1));
    const popularityWeight = 0.1;

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
    const dailyTrendingArtists = Object.entries(artistMomentum)
        .map(([name, data]) => ({
            artistId: data.artistId,
            momentum: data.tagCount + data.searchCount + data.popularity * popularityWeight
        }))
        .sort((a, b) => b.momentum - a.momentum);

    // Store daily trending artists in the database with the current date
    for (const artist of dailyTrendingArtists) {
        if (artist.artistId) {
            await prisma.trendingArtist.create({
                data: {
                    artistId: artist.artistId,
                    momentum: artist.momentum,
                    date: oneDayAgo // store the date for historical tracking
                }
            });
        }
    }
}

// Schedule a cron job to calculate trending artists every day at 10am
cron.schedule('0 10 * * *', async () => {
    await calculateTrendingArtists();
});

// Cleanup old records (older than 2 weeks at 11am everyday)
cron.schedule('0 11 * * *', async () => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    await prisma.trendingArtist.deleteMany({
        where: {
            date: {
                lt: twoWeeksAgo
            }
        }
    });
});
