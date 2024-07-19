//FOR TESTING PURPOSES. I WILL DELETE CONSOLE.LOGS AFTER THIS PR IS APPROVED
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cron = require('node-cron');

// Mock data for benchmarking
const mockSongs = [
    { id: 1, title: 'Song1', artist: 'Artist1', genre: 'pop', mood: 'happy', tempo: 'fast', userId: 1 },
    { id: 2, title: 'Song2', artist: 'Artist1', genre: 'pop', mood: 'happy', tempo: 'fast', userId: 2 },
    { id: 3, title: 'Song3', artist: 'Artist2', genre: 'pop', mood: 'happy', tempo: 'fast', userId: 3 },
    { id: 4, title: 'Song4', artist: 'Artist2', genre: 'rock', mood: 'sad', tempo: 'medium', userId: 4 },
    { id: 5, title: 'Song5', artist: 'Artist3', genre: 'jazz', mood: 'energetic', tempo: 'slow', userId: 1 },
    { id: 6, title: 'Song6', artist: 'Artist3', genre: 'jazz', mood: 'energetic', tempo: 'slow', userId: 2 },
    { id: 7, title: 'Song7', artist: 'Artist4', genre: 'jazz', mood: 'energetic', tempo: 'slow', userId: 3 },
    { id: 8, title: 'Song8', artist: 'Artist4', genre: 'classical', mood: 'relaxed', tempo: 'veryslow', userId: 4 },
    { id: 9, title: 'Song9', artist: 'Artist5', genre: 'hiphop', mood: 'angry', tempo: 'fast', userId: 5 },
    { id: 10, title: 'Song10', artist: 'Artist5', genre: 'hiphop', mood: 'angry', tempo: 'fast', userId: 6 },
];

const mockPreviousRecommendations = [
    { id: 1, userId: 1, artistName: 'Artist1', reason: 'Because you listened to "Song1" by Artist1, here is an artist you might like: Artist1' },
    { id: 2, userId: 2, artistName: 'Artist2', reason: 'Because you listened to "Song2" by Artist2, here is an artist you might like: Artist2' },
];

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

const tagWeights = {
    genre: 0.5, // Genre is worth 50%
    mood: 0.3,  // Mood is worth 30%
    tempo: 0.2  // Tempo is worth 20%
};

// Function to benchmark recommendation calculation
async function benchmarkRecommendations(calculateRecommendations) {
    console.time('calculateRecommendations');
    await calculateRecommendations();
    console.timeEnd('calculateRecommendations');
}

// Initial implementation
async function calculateRecommendationsInitial() {
    console.log('Start calculating recommendations');
    const songs = mockSongs; // Use mock data for benchmarking
    console.log('Fetched songs:', songs);

    const userTagHistory = {}; // Store users' music tags
    const tagIndices = {
        genre: {}, // Keep track of users by genre
        mood: {}, // Keep track of users by mood
        tempo: {} // Keep track of users by tempo
    };

    // Go through each song
    for (const song of songs) {
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

    console.log('User tag history:', userTagHistory);
    console.log('Tag indices:', tagIndices);

    const userSimilarities = {}; // Store how similar users are
    const threshold = 0.5; // Lowered the similarity score threshold to recommend an artist

    // Compare users based on their tags
    for (const user1 in userTagHistory) {
        for (const tagType in tagIndices) {
            for (const tagValue in tagIndices[tagType]) {
                const usersWithTag = tagIndices[tagType][tagValue];

                if (!usersWithTag.includes(user1)) continue; // Skip if user1 doesn't have this tag

                for (const user2 of usersWithTag) {
                    if (user1 === user2) continue; // Don't compare a user with themselves

                    console.log(`Comparing User ${user1} and User ${user2}`);

                    // Compare tags between the two users
                    const tagPairs = userTagHistory[user1].flatMap(tag1 => userTagHistory[user2].map(tag2 => ({ tag1, tag2 })));

                    let similarityScore = 0; // Move similarity score initialization here

                    for (const { tag1, tag2 } of tagPairs) {
                        // Add to similarity score if tags match
                        if (tag1.genre === tag2.genre) similarityScore += tagWeights.genre;
                        if (tag1.mood === tag2.mood) similarityScore += tagWeights.mood;
                        if (tag1.tempo === tag2.tempo) similarityScore += tagWeights.tempo;
                    }

                    console.log(`Similarity score between User ${user1} and User ${user2}: ${similarityScore}`);

                    // If similarity score is high enough, remember it
                    if (similarityScore >= threshold) {
                        if (!userSimilarities[user1]) {
                            userSimilarities[user1] = [];
                        }
                        if (!userSimilarities[user2]) {
                            userSimilarities[user2] = [];
                        }

                        userSimilarities[user1].push({ userId: user2, similarityScore });
                        userSimilarities[user2].push({ userId: user1, similarityScore });
                    }
                }
            }
        }
    }

    console.log('User similarities:', userSimilarities);

    const recommendations = {}; // Store the recommendations

    // Recommend artists based on similar users
    for (const user in userSimilarities) {
        const similarUsers = userSimilarities[user];
        const artistCount = {}; // Count how many times each artist appears
        const reasonDetails = []; // Collect detailed reasons for recommendation

        // Fetch previous recommendations for the user
        const previousRecommendations = mockPreviousRecommendations.filter(rec => rec.userId === parseInt(user));
        const previouslyRecommendedArtists = new Set(previousRecommendations.map(rec => rec.artistName));

        for (const similarUser of similarUsers) {
            const similarUserId = similarUser.userId;

            // Find songs of similar users
            const similarUserSongs = songs.filter(song => song.userId === similarUserId);

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

    console.log('Recommendations:', recommendations);

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

    console.log('Recommendations saved to database');
}

// Optimized implementation
async function calculateRecommendationsOptimized() {
    console.log('Start calculating recommendations');
    const songs = mockSongs; // Use mock data for benchmarking
    console.log('Fetched songs:', songs);

    const userTagHistory = {}; // Store users' music tags
    const tagIndices = {
        genre: {}, // Keep track of users by genre
        mood: {}, // Keep track of users by mood
        tempo: {} // Keep track of users by tempo
    };

    // Go through each song
    for (const song of songs) {
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

    console.log('User tag history:', userTagHistory);
    console.log('Tag indices:', tagIndices);

    const userSimilarities = {}; // Store how similar users are
    const threshold = 0.5; // Lowered the similarity score threshold to recommend an artist

    // Compare users based on their tags
    for (const user1 in userTagHistory) {
        const user1Tags = userTagHistory[user1];

        for (const tagType in tagIndices) {
            for (const tagValue in tagIndices[tagType]) {
                const usersWithTag = tagIndices[tagType][tagValue];

                if (!usersWithTag.includes(user1)) continue; // Skip if user1 doesn't have this tag

                for (const user2 of usersWithTag) {
                    if (user1 === user2) continue; // Don't compare a user with themselves

                    const user2Tags = userTagHistory[user2];
                    let similarityScore = 0;

                    // Generate tag pairs and calculate similarity
                    for (const tag1 of user1Tags) {
                        for (const tag2 of user2Tags) {
                            if (tag1.genre === tag2.genre) similarityScore += tagWeights.genre;
                            if (tag1.mood === tag2.mood) similarityScore += tagWeights.mood;
                            if (tag1.tempo === tag2.tempo) similarityScore += tagWeights.tempo;
                        }
                    }

                    console.log(`Similarity score between User ${user1} and User ${user2}: ${similarityScore}`);

                    // If similarity score is high enough, remember it
                    if (similarityScore >= threshold) {
                        if (!userSimilarities[user1]) {
                            userSimilarities[user1] = [];
                        }
                        if (!userSimilarities[user2]) {
                            userSimilarities[user2] = [];
                        }

                        userSimilarities[user1].push({ userId: user2, similarityScore });
                        userSimilarities[user2].push({ userId: user1, similarityScore });
                    }
                }
            }
        }
    }

    console.log('User similarities:', userSimilarities);

    const recommendations = {}; // Store the recommendations

    // Recommend artists based on similar users
    for (const user in userSimilarities) {
        const similarUsers = userSimilarities[user];
        const artistCount = {}; // Count how many times each artist appears
        const reasonDetails = []; // Collect detailed reasons for recommendation

        // Fetch previous recommendations for the user
        const previousRecommendations = mockPreviousRecommendations.filter(rec => rec.userId === parseInt(user));
        const previouslyRecommendedArtists = new Set(previousRecommendations.map(rec => rec.artistName));

        for (const similarUser of similarUsers) {
            const similarUserId = similarUser.userId;

            // Find songs of similar users
            const similarUserSongs = songs.filter(song => song.userId === similarUserId);

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

    console.log('Recommendations:', recommendations);

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

    console.log('Recommendations saved to database');
}

// Running the benchmark for initial and optimized implementations
async function runBenchmarks() {
    console.log('Benchmarking initial implementation:');
    await benchmarkRecommendations(calculateRecommendationsInitial);

    console.log('Benchmarking optimized implementation:');
    await benchmarkRecommendations(calculateRecommendationsOptimized);
}

runBenchmarks();
