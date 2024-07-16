const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cron = require('node-cron');

async function calculateRecommendations() {
    // Fetch all songs with tags from the database
    const songs = await prisma.song.findMany({
        include: {
            user: true
        }
    });

    // Create a map to store users' tag histories
    const userTagHistory = {};

    // Populate userTagHistory with song tags
    for (const song of songs) {
        const { userId, customTags } = song;
        if (!userTagHistory[userId]) {
            userTagHistory[userId] = new Set();
        }
        const tags = customTags ? JSON.parse(customTags) : [];
        tags.forEach(tag => userTagHistory[userId].add(tag));
    }

    // Calculate vector similarity between users based on their tag histories
    const userSimilarities = {};

    const users = Object.keys(userTagHistory);

    for (let i = 0; i < users.length; i++) {
        for (let j = i + 1; j < users.length; j++) {
            const user1 = users[i];
            const user2 = users[j];
            const commonTags = [...userTagHistory[user1]].filter(tag => userTagHistory[user2].has(tag));

            if (commonTags.length > 0) {
                if (!userSimilarities[user1]) {
                    userSimilarities[user1] = [];
                }
                if (!userSimilarities[user2]) {
                    userSimilarities[user2] = [];
                }
                userSimilarities[user1].push({ userId: user2, commonTags });
                userSimilarities[user2].push({ userId: user1, commonTags });
            }
        }
    }

    // Recommend a single artist based on similar users' tags
    const recommendations = {};

    for (const user in userSimilarities) {
        const similarUsers = userSimilarities[user];
        const artistCount = {};

        for (const similarUser of similarUsers) {
            const similarUserId = similarUser.userId;

            // Fetch songs of similar users
            const similarUserSongs = await prisma.song.findMany({
                where: {
                    userId: similarUserId
                }
            });

            // Count artists from similar users' songs
            for (const song of similarUserSongs) {
                const { artist } = song;

                if (!artistCount[artist]) {
                    artistCount[artist] = 0;
                }
                artistCount[artist]++;
            }
        }

        // Find the most common artist
        const recommendedArtist = Object.keys(artistCount).reduce((a, b) => artistCount[a] > artistCount[b] ? a : b);

        recommendations[user] = recommendedArtist;
    }

    // Save recommendations to the database
    for (const user in recommendations) {
        const recommendedArtist = recommendations[user];

        // Delete existing recommendation for the user
        await prisma.recommendation.deleteMany({
            where: { userId: parseInt(user) }
        });

        // Save new recommendation
        await prisma.recommendation.create({
            data: {
                userId: parseInt(user),
                artistName: recommendedArtist
            }
        });
    }
}

// Schedule a cron job to calculate recommendations every 3 hours
cron.schedule('0 */3 * * *', async () => {
    await calculateRecommendations();
});
