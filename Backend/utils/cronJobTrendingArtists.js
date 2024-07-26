const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const calculatePopularityScore = require('./calculatePopularityScore');

async function calculateTrendingArtists() {
    const now = new Date();
    const oneDayAgo = new Date(now.setDate(now.getDate() - 1));
    const twoWeeksAgo = new Date(now.setDate(now.getDate() - 14));

    // Get the daily trending artists
    const dailyTrendingArtists = await calculatePopularityScore();

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

async function cleanupOldRecords() {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    await prisma.trendingArtist.deleteMany({
        where: {
            date: {
                lt: twoWeeksAgo
            }
        }
    });
}

module.exports = {
    calculateTrendingArtists,
    cleanupOldRecords
};
