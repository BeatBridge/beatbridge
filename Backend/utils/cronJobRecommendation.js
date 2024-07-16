const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cron = require('node-cron');

// Define tag values
const tagValues = {
    genre: { pop: 1, rock: 2, jazz: 3 },
    mood: { happy: 1, sad: 2, energetic: 3 },
    tempo: { slow: 1, medium: 2, fast: 3 }
};

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
        const { userId, genre, mood, tempo } = song;
        if (!userTagHistory[userId]) {
            userTagHistory[userId] = [];
        }

        // Assign numerical values to tags
        const tagCombination = [
            tagValues.genre[genre],
            mood ? tagValues.mood[mood] : 0,
            tempo ? tagValues.tempo[tempo] : 0
        ];

        userTagHistory[userId].push(tagCombination.join('-'));
        //dont compare exactly. compare by creating vector for each tag value. come upw with a fucntion that compares teh vectors and gives a vector, and make teh threshold 2. so ut doenst have to completely match.
    }

    // Calculate vector similarity between users based on their tag histories
    const userSimilarities = {};

    const users = Object.keys(userTagHistory);

    for (let i = 0; i < users.length; i++) {
        for (let j = i + 1; j < users.length; j++) {
            const user1 = users[i];
            const user2 = users[j];
            const commonTags = userTagHistory[user1].filter(tag => userTagHistory[user2].includes(tag));

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

    //create a mao for each artist, and link users to the tags. directly comparing the
    //billish eilish has 200, for jazz, 300 for pop, and then loop over the user, so loop over the user and find the artist for that user. based on tthe tag count.
    //link each artist with theur popularity score from spotify.

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

        //if teh artist already doesnt exist on the user's taggeed songs yet
    }

    // Save recommendations to the database
    for (const user in recommendations) {
        const recommendedArtist = recommendations[user];

        // Save new recommendation
        await prisma.recommendation.create({
            data: {
                userId: parseInt(user),
                artistName: recommendedArtist
            }
        });
    }
}

//have a minimun bar if user doesnt have enough data to genrate recmmended songs. and redisplay global trending.
//find how small an artist is with their followers count, and their position in the top50 global trending.

// Schedule a cron job to calculate recommendations every 3 hours
cron.schedule('0 */3 * * *', async () => {
    await calculateRecommendations();
});
