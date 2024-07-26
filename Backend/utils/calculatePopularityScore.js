const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function calculatePopularityScore() {
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

    // Calculate trending popularity score for each artist
    const artistScores = {};

    // Add tagged songs score
    for (const tag of recentTags) {
        const artistName = tag.artist;
        if (!artistScores[artistName]) {
            artistScores[artistName] = {
                tagCount: 0,
                popularity: 0,
                searchCount: 0,
                artistId: null,
            };
        }
        artistScores[artistName].tagCount += 1;

        const artist = await prisma.artist.findFirst({
            where: { name: artistName }
        });

        if (artist) {
            artistScores[artistName].popularity = artist.popularity;
            artistScores[artistName].artistId = artist.id;
        }
    }

    // Add search count score
    for (const search of recentSearches) {
        const artistName = search.artist.name;
        if (!artistScores[artistName]) {
            artistScores[artistName] = {
                tagCount: 0,
                popularity: 0,
                searchCount: 0,
                artistId: search.artist.id,
            };
        }
        artistScores[artistName].searchCount += 1;
    }

    // Calculate popularity score
    return Object.entries(artistScores)
        .map(([name, data]) => ({
            artistId: data.artistId,
            popularityScore: data.tagCount + data.searchCount + data.popularity * popularityWeight
        }));
}

module.exports = calculatePopularityScore;
