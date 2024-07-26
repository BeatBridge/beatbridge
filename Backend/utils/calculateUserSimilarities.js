const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const tagValues = require('./tagValues');

async function calculateUserSimilarities(userTagHistory, uniqueUserIds, userPreferences) {
    const tagWeights = getTagWeights(userPreferences);
    const threshold = userPreferences.threshold || 0.7;
    const userSimilarities = {};
    const comparedPairs = new Set();

    for (const user1 of uniqueUserIds) {
        const user1Tags = userTagHistory[user1];

        for (const user2 in userTagHistory) {
            if (user1 === user2) continue;

            const pair = [user1, user2].sort().join(',');
            if (comparedPairs.has(pair)) continue;

            const user2Tags = userTagHistory[user2];
            let similarityScore = 0;

            for (const tag1 of user1Tags) {
                for (const tag2 of user2Tags) {
                    if (tag1.genre === tag2.genre) similarityScore += tagWeights.genre;
                    if (tag1.mood === tag2.mood) similarityScore += tagWeights.mood;
                    if (tag1.tempo === tag2.tempo) similarityScore += tagWeights.tempo;
                }
            }

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

            comparedPairs.add(pair);
        }
    }

    return userSimilarities;
}

function getTagWeights(userPreferences) {
    const selectedTags = ['genre', 'mood', 'tempo'].filter(tag => userPreferences[tag]);
    const selectedCount = selectedTags.length;

    if (selectedCount === 0 || selectedCount === 3) {
        return { genre: 0.5, mood: 0.3, tempo: 0.2 };
    } else if (selectedCount === 2) {
        return {
            genre: selectedTags.includes('genre') ? 0.5 : 0,
            mood: selectedTags.includes('mood') ? 0.5 : 0,
            tempo: selectedTags.includes('tempo') ? 0.5 : 0
        };
    } else if (selectedCount === 1) {
        return {
            genre: selectedTags.includes('genre') ? 1 : 0,
            mood: selectedTags.includes('mood') ? 1 : 0,
            tempo: selectedTags.includes('tempo') ? 1 : 0
        };
    }

    return { genre: 0.5, mood: 0.3, tempo: 0.2 };
}

module.exports = calculateUserSimilarities;
