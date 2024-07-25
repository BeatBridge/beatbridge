const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cron = require('node-cron');

const tagValues = {
    genre: {
        afrobeats: 1,
        alternative: 2,
        blues: 3,
        classical: 4,
        country: 5,
        dance: 6,
        disco: 7,
        dubstep: 8,
        electronic: 9,
        folk: 10,
        funk: 11,
        gospel: 12,
        grunge: 13,
        hiphop: 14,
        house: 15,
        indie: 16,
        jazz: 17,
        metal: 18,
        opera: 19,
        pop: 20,
        punk: 21,
        rap: 22,
        reggae: 23,
        rock: 24,
        rnb: 25,
        soul: 26,
        techno: 27,
        trance: 28
    },
    mood: {
        happy: 1,
        sad: 2,
        energetic: 3,
        relaxed: 4,
        angry: 5,
        romantic: 6,
        melancholic: 7,
        upbeat: 8,
        peaceful: 9,
        moody: 10,
        excited: 11,
        nostalgic: 12
    },
    tempo: {
        veryslow: 1,
        slow: 2,
        medium: 3,
        fast: 4,
        veryfast: 5
    }
};

async function calculateRecommendations(userPreferences = { genre: 0.5, mood: 0.3, tempo: 0.2 }) {
    const MILLISECONDS_PER_SECOND = 1000;
    const SECONDS_PER_MINUTE = 60;
    const MINUTES_PER_HOUR = 60;
    const HOURS_AGO = 3;
    const threeHoursAgo = new Date(Date.now() - HOURS_AGO * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND);

    // Get songs with tags updated in the last 3 hours
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

    // Get all songs to initialize the complete tag history and indices
    const allSongs = await prisma.song.findMany({
        include: {
            user: true
        }
    });

    const userTagHistory = {}; // Store users' music tags
    const tagIndices = {
        genre: {}, // Keep track of users by genre
        mood: {}, // Keep track of users by mood
        tempo: {} // Keep track of users by tempo
    };

    // Initialize user tag history and indices with all songs
    for (const song of allSongs) {
        const { userId, genre, mood, tempo } = song;
        if (!userTagHistory[userId]) {
            userTagHistory[userId] = []; // Create a list for this user's tags if it doesn't exist
        }

        // Turn the tags into numbers we can compare
        const tagCombination = {
            genre: tagValues.genre[genre],
            mood: tagValues.mood[mood],
            tempo: tagValues.tempo[tempo]
        };

        userTagHistory[userId].push(tagCombination); // Add the tags to the user's list

        // Add user to genre index
        if (!tagIndices.genre[tagCombination.genre]) tagIndices.genre[tagCombination.genre] = [];
        tagIndices.genre[tagCombination.genre].push(userId);

        // Add user to mood index, if mood is present
        if (tagCombination.mood) {
            if (!tagIndices.mood[tagCombination.mood]) tagIndices.mood[tagCombination.mood] = [];
            tagIndices.mood[tagCombination.mood].push(userId);
        }

        // Add user to tempo index, if tempo is present
        if (tagCombination.tempo) {
            if (!tagIndices.tempo[tagCombination.tempo]) tagIndices.tempo[tagCombination.tempo] = [];
            tagIndices.tempo[tagCombination.tempo].push(userId);
        }
    }

    const userSimilarities = {}; // Store how similar users are
    const threshold = 0.7; // The similarity score needed to recommend an artist

    const comparedPairs = new Set(); // Initialize the set of compared pairs

    // Adjust tag weights based on user preferences
    let tagWeights;
    if (userPreferences) {
        const selectedTags = ['genre', 'mood', 'tempo'].filter(tag => userPreferences[tag]);
        const selectedCount = selectedTags.length;

        if (selectedCount === 0 || selectedCount === 3) {
            // Default weights if all or no tags are selected
            tagWeights = { genre: 0.5, mood: 0.3, tempo: 0.2 };
        } else if (selectedCount === 2) {
            // Each selected tag gets a weight of 0.5 if two tags are selected
            tagWeights = {
                genre: selectedTags.includes('genre') ? 0.5 : 0,
                mood: selectedTags.includes('mood') ? 0.5 : 0,
                tempo: selectedTags.includes('tempo') ? 0.5 : 0
            };
        } else if (selectedCount === 1) {
            // The selected tag gets a weight of 1 if one tag is selected
            tagWeights = {
                genre: selectedTags.includes('genre') ? 1 : 0,
                mood: selectedTags.includes('mood') ? 1 : 0,
                tempo: selectedTags.includes('tempo') ? 1 : 0
            };
        }
    } else {
        tagWeights = { genre: 0.5, mood: 0.3, tempo: 0.2 };
    }

    // Compare users based on their tags
    for (const user1 of uniqueUserIds) {
        const user1Tags = userTagHistory[user1];

        for (const user2 in userTagHistory) {
            if (user1 === user2) continue; // Don't compare a user with themselves

            const pair = [user1, user2].sort().join(',');
            if (comparedPairs.has(pair)) continue; // Skip if the pair has already been compared

            const user2Tags = userTagHistory[user2];
            let similarityScore = 0;

            // Calculate similarity score outside the innermost loop
            for (const tag1 of user1Tags) {
                for (const tag2 of user2Tags) {
                    // Add to similarity score if tags match
                    if (tag1.genre === tag2.genre) similarityScore += tagWeights.genre;
                    if (tag1.mood === tag2.mood) similarityScore += tagWeights.mood;
                    if (tag1.tempo === tag2.tempo) similarityScore += tagWeights.tempo;
                }
            }

            // If similarity score is high enough, remember it
            if (similarityScore >= threshold) {
                if (!userSimilarities[user1]) {
                    userSimilarities[user1] = {};
                }
                if (!userSimilarities[user2]) {
                    userSimilarities[user2] = {};
                }

                userSimilarities[user1][user2] = (userSimilarities[user1][user2] || 0) + similarityScore;
                userSimilarities[user2][user1] = (userSimilarities[user2][user1] || 0) + similarityScore;
            }

            comparedPairs.add(pair); // Add the pair to the set of compared pairs
        }
    }

    const recommendations = {}; // Store the recommendations

    // Recommend artists based on similar users
    for (const user in userSimilarities) {
        const similarUsers = Object.entries(userSimilarities[user]);
        const artistCount = {}; // Count how many times each artist appears
        const reasonDetails = []; // Collect detailed reasons for recommendation

        // Fetch previous recommendations for the user
        const previousRecommendations = await prisma.recommendation.findMany({
            where: { userId: parseInt(user) },
            select: { artistName: true }
        });
        const previouslyRecommendedArtists = new Set(previousRecommendations.map(rec => rec.artistName));

        for (const [similarUserId, similarityScore] of similarUsers) {
            // Find songs of similar users
            const similarUserSongs = await prisma.song.findMany({
                where: {
                    userId: parseInt(similarUserId)
                }
            });

            // Count the artists in these songs and collect reasons
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

        // Find the most common artist
        const recommendedArtist = Object.keys(artistCount).reduce((a, b) => artistCount[a] > artistCount[b] ? a : b);

        if (recommendedArtist) {
            // Construct the detailed reason for recommendation
            const reason = `Because ${reasonDetails.join(", ")}, here is an artist you might like: ${recommendedArtist}`;

            recommendations[user] = { artistName: recommendedArtist, reason }; // Save the recommendation with reason
        }
    }

    // Save the recommendations to the database and update the recommended artist for each user
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

// Schedule the recommendations to run every 3 hours
cron.schedule('0 */3 * * *', async () => {
    await calculateRecommendations();
});

module.exports = { calculateRecommendations }
