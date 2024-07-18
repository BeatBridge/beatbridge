const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cron = require('node-cron');

const tagValues = {
    genre: {
        pop: 1, rock: 2, jazz: 3, classical: 4, afrobeats: 5, hiphop: 6, electronic: 7, reggae: 8, blues: 9, country: 10,
        folk: 11, metal: 12, rnb: 13, soul: 14, funk: 15, disco: 16, techno: 17, house: 18, dubstep: 19,
        trance: 20, dance: 21, indie: 22, alternative: 23, punk: 24, grunge: 25, opera: 26, gospel: 27
    },
    mood: {
        happy: 1, sad: 2, energetic: 3, relaxed: 4, angry: 5, romantic: 6, melancholic: 7, upbeat: 8,
        peaceful: 9, moody: 10, excited: 11, nostalgic: 12
    },
    tempo: {
        slow: 1, medium: 2, fast: 3, veryslow: 4, veryfast: 5
    }
};

// Giving weights to each tag type to show how important they are
const tagWeights = {
    genre: 0.5, // Genre is worth 50%
    mood: 0.3,  // Mood is worth 30%
    tempo: 0.2  // Tempo is worth 20%
};

async function calculateRecommendations() {
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
            userTagHistory[userId] = []; // Initialize user's tag history if not already
        }

        // Assign numerical values to tags
        const tagCombination = {
            //TODO: Make the tags required
            genre: tagValues.genre[genre], // Convert genre to number
            mood: mood ? tagValues.mood[mood] : 0, // Convert mood to number, if exists
            tempo: tempo ? tagValues.tempo[tempo] : 0 // Convert tempo to number, if exists
        };

        userTagHistory[userId].push(tagCombination); // Add tag combination to user's history
    }

    // Calculate vector similarity between users based on their tag histories
    const userSimilarities = {};
    const threshold = 0.7; //Threshold for recommending an artist

    const users = Object.keys(userTagHistory); // Get list of all users

    // Compare every user with every other user
    //TODO: make it more optimized
    for (let i = 0; i < users.length; i++) {
        for (let j = i + 1; j < users.length; j++) {
            const user1 = users[i];
            const user2 = users[j];

            // Create pairs of tags from user1 and user2 to compare them
            const tagPairs = userTagHistory[user1].flatMap(tag1 => userTagHistory[user2].map(tag2 => ({ tag1, tag2 })));

            for (const { tag1, tag2 } of tagPairs) { //For each pair of tags
                let similarityScore = 0; // Initialize similarity score

                // Compare the genre tags and add to the similarity score if they match
                if (tag1.genre === tag2.genre) similarityScore += tagWeights.genre;
                // Compare the mood tags and add to the similarity score if they match
                if (tag1.mood === tag2.mood) similarityScore += tagWeights.mood;
                // Compare the tempo tags and add to the similarity score if they match
                if (tag1.tempo === tag2.tempo) similarityScore += tagWeights.tempo;

                // If similarity score is above or equal to the threshold, save the similarity
                if (similarityScore >= threshold) {
                    if (!userSimilarities[user1]) {
                        userSimilarities[user1] = []; // Initialize if not already present
                    }
                    if (!userSimilarities[user2]) {
                        userSimilarities[user2] = [];
                    }

                    // Save all similarity information
                    userSimilarities[user1].push({ userId: user2, similarityScore });
                    userSimilarities[user2].push({ userId: user1, similarityScore });
                }
            }
        }
    }

    // Recommend a single artist based on similar users' tags
    const recommendations = {}; // This will store the recommended artist for each user

    // Loop through each user who has similar users
    for (const user in userSimilarities) {
        const similarUsers = userSimilarities[user]; // Get the list of similar users for the current user
        const artistCount = {}; // This will count how many times each artist appears

        // Loop through each similar user
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

        recommendations[user] = recommendedArtist; // Save the most common artist as the recommendation
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

// Schedule a cron job to calculate recommendations every 3 hours
cron.schedule('0 */3 * * *', async () => {
    await calculateRecommendations(); // Run the function to calculate recommendations
});
