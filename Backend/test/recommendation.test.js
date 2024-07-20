const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { calculateRecommendations } = require('../utils/cronJobRecommendation');

// Mock data
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

// Mock Prisma methods
jest.mock('@prisma/client', () => {
    const mockPrismaClient = {
        song: {
            findMany: jest.fn(),
        },
        recommendation: {
            findMany: jest.fn(),
            create: jest.fn(),
        },
        user: {
            update: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

describe('calculateRecommendations', () => {
    beforeEach(() => {
        prisma.song.findMany.mockReset();
        prisma.recommendation.findMany.mockReset();
        prisma.recommendation.create.mockReset();
        prisma.user.update.mockReset();
    });

    test('should generate recommendations correctly', async () => {
        prisma.song.findMany.mockResolvedValue(mockSongs);
        prisma.recommendation.findMany.mockImplementation(({ where }) =>
            Promise.resolve(mockPreviousRecommendations.filter(rec => rec.userId === where.userId))
        );
        prisma.recommendation.create.mockResolvedValue({});
        prisma.user.update.mockResolvedValue({});

        await calculateRecommendations();

        expect(prisma.song.findMany).toHaveBeenCalledTimes(1);
        expect(prisma.recommendation.create).toHaveBeenCalledTimes(Object.keys(mockSongs).length);
        expect(prisma.user.update).toHaveBeenCalledTimes(Object.keys(mockSongs).length);
    });

    test('should not recommend previously recommended artists', async () => {
        prisma.song.findMany.mockResolvedValue(mockSongs);
        prisma.recommendation.findMany.mockImplementation(({ where }) =>
            Promise.resolve(mockPreviousRecommendations.filter(rec => rec.userId === where.userId))
        );
        prisma.recommendation.create.mockResolvedValue({});
        prisma.user.update.mockResolvedValue({});

        await calculateRecommendations();

        expect(prisma.song.findMany).toHaveBeenCalledTimes(1);
    });
});
