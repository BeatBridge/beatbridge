const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const calculateUserSimilarities = require('./calculateUserSimilarities');
const tagValues = require('./tagValues');

async function calculateRecommendations(userPreferences = { genre: 0.5, mood: 0.3, tempo: 0.2, threshold: 0.7 }) {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

    const recentSongs = await prisma.song.findMany({
        where: {
            updatedAt: {
                gte: threeHoursAgo
            }
        },
        include: {
            user: true
        }
    });

    const uniqueUserIds = recentSongs.reduce((acc, song) => {
        acc.add(song.userId);
        return acc;
    }, new Set());

    const allSongs = await prisma.song.findMany({
        include: {
            user: true
        }
    });

    const userTagHistory = {};
    const tagIndices = {
        genre: {},
        mood: {},
        tempo: {}
    };

    for (const song of allSongs) {
        const { userId, genre, mood, tempo } = song;
        if (!userTagHistory[userId]) {
            userTagHistory[userId] = [];
        }

        const tagCombination = {
            genre: tagValues.genre[genre],
            mood: tagValues.mood[mood],
            tempo: tagValues.tempo[tempo]
        };

        userTagHistory[userId].push(tagCombination);

        if (!tagIndices.genre[tagCombination.genre]) tagIndices.genre[tagCombination.genre] = [];
        tagIndices.genre[tagCombination.genre].push(userId);

        if (tagCombination.mood) {
            if (!tagIndices.mood[tagCombination.mood]) tagIndices.mood[tagCombination.mood] = [];
            tagIndices.mood[tagCombination.mood].push(userId);
        }

        if (tagCombination.tempo) {
            if (!tagIndices.tempo[tagCombination.tempo]) tagIndices.tempo[tagCombination.tempo] = [];
            tagIndices.tempo[tagCombination.tempo].push(userId);
        }
    }

    const userSimilarities = await calculateUserSimilarities(userTagHistory, uniqueUserIds, userPreferences);
    const recommendations = {};

    for (const user in userSimilarities) {
        const similarUsers = Object.entries(userSimilarities[user]);
        const artistCount = {};
        const reasonDetails = [];

        const previousRecommendations = await prisma.recommendation.findMany({
            where: { userId: parseInt(user) },
            select: { artistName: true }
        });
        const previouslyRecommendedArtists = new Set(previousRecommendations.map(rec => rec.artistName));

        for (const [similarUserId, similarityScore] of similarUsers) {
            const similarUserSongs = await prisma.song.findMany({
                where: {
                    userId: parseInt(similarUserId)
                }
            });

            for (const song of similarUserSongs) {
                const { artist, title } = song;

                if (!previouslyRecommendedArtists.has(artist)) {
                    if (!artistCount[artist]) {
                        artistCount[artist] = 0;
                    }
                    artistCount[artist]++;

                    reasonDetails.push(`you listened to "${title}" by ${artist}`);
                }
            }
        }

        const recommendedArtist = Object.keys(artistCount).reduce((a, b) => artistCount[a] > artistCount[b] ? a : b);

        if (recommendedArtist) {
            const reason = `Because ${reasonDetails.join(", ")}, here is an artist you might like: ${recommendedArtist}`;

            recommendations[user] = { artistName: recommendedArtist, reason };
        }
    }

    for (const user in recommendations) {
        const { artistName, reason } = recommendations[user];

        await prisma.recommendation.create({
            data: {
                userId: parseInt(user),
                artistName,
                reason
            }
        });

        await prisma.user.update({
            where: { id: parseInt(user) },
            data: { recommendedArtist: artistName }
        });
    }
}

module.exports = { calculateRecommendations };
