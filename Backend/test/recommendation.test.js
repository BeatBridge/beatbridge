const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { mockUsers, mockSongs, mockRecommendations } = require('./mockData');
const { calculateRecommendations } = require('../utils/cronJobRecommendation');

// Mock Prisma methods
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    song: {
      findMany: jest.fn(),
    },
    recommendation: {
      findMany: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

describe('Recommendation Algorithm', () => {
  beforeEach(() => {
    prisma.song.findMany.mockReset();
    prisma.recommendation.findMany.mockReset();
    prisma.recommendation.create.mockReset();
    prisma.recommendation.upsert.mockReset();
    prisma.user.findUnique.mockReset();
    prisma.user.update.mockReset();
  });

  test('should generate recommendations correctly', async () => {
    prisma.song.findMany.mockResolvedValue(mockSongs);
    prisma.recommendation.findMany.mockResolvedValue([]);
    prisma.recommendation.create.mockResolvedValue({});
    prisma.user.update.mockResolvedValue({});

    await calculateRecommendations();

    expect(prisma.song.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.recommendation.create).toHaveBeenCalledTimes(mockUsers.length);
    expect(prisma.user.update).toHaveBeenCalledTimes(mockUsers.length);
  });

  test('should not recommend previously recommended artists', async () => {
    prisma.song.findMany.mockResolvedValue(mockSongs);
    prisma.recommendation.findMany.mockResolvedValue(mockRecommendations);
    prisma.recommendation.create.mockResolvedValue({});
    prisma.user.update.mockResolvedValue({});

    await calculateRecommendations();

    expect(prisma.song.findMany).toHaveBeenCalledTimes(1);
  });

});
