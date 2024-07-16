const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cron = require('node-cron');

async function calculateTrendingArtists() {
    const now = new Date();
    const oneDayAgo = new Date(now.setDate(now.getDate() - 1));
    const twoWeeksAgo = new Date(now.setDate(now.getDate() - 14));
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
    const dailyTrendingArtists = Object.entries(artistScores)
        .map(([name, data]) => ({
            artistId: data.artistId,
            popularityScore: data.tagCount + data.searchCount + data.popularity * popularityWeight
        }));

    // Store daily popularity scores in the database with the current date
    for (const artist of dailyTrendingArtists) {
        if (artist.artistId) {
            await prisma.trendingArtist.create({
                data: {
                    artistId: artist.artistId,
                    popularityScore: artist.popularityScore,
                    date: oneDayAgo, // store the date for historical tracking
                    momentum: 0 // Initialize momentum to 0 for now
                }
            });
        }
    }

    // Fetch popularity scores from the last two weeks
    const trendingArtistsTwoWeeks = await prisma.trendingArtist.findMany({
        where: {
            date: {
                gte: twoWeeksAgo
            }
        },
        orderBy: {
            date: 'asc'
        }
    });

    // Calculate momentum by comparing scores
    const momentumData = {};

    for (const record of trendingArtistsTwoWeeks) {
        if (!momentumData[record.artistId]) {
            momentumData[record.artistId] = [];
        }
        momentumData[record.artistId].push(record.popularityScore);
    }

    const momentumResults = Object.entries(momentumData)
        .map(([artistId, scores]) => {
            const scoreLength = scores.length;
            const recentScore = scores[scoreLength - 1] || 0;
            const previousScore = scores[scoreLength - 8]; // 7 days ago score
            const momentumScore = (recentScore / previousScore) || 0; // if momentum doesnt exist then momentumScore is zero
            return {
                artistId: parseInt(artistId),
                momentum: momentumScore
            };
        })
        .sort((a, b) => b.momentum - a.momentum);

    // Update momentum in the database
    for (const artist of momentumResults) {
        await prisma.trendingArtist.updateMany({
            where: {
                artistId: artist.artistId,
                date: oneDayAgo
            },
            data: {
                momentum: artist.momentum
            }
        });
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
