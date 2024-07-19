const mockUsers = [
    { id: 1, username: 'user1', email: 'user1@example.com' },
    { id: 2, username: 'user2', email: 'user2@example.com' },

  ];

  const mockSongs = [
    { id: 1, title: 'Song1', artist: 'Artist1', genre: 'pop', mood: 'happy', tempo: 'fast', userId: 1 },
    { id: 2, title: 'Song2', artist: 'Artist2', genre: 'rock', mood: 'sad', tempo: 'medium', userId: 2 },
  ];

  const mockRecommendations = [
    { id: 1, userId: 1, artistName: 'Artist2', reason: 'Because you listened to "Song2" by Artist2', createdAt: new Date() },
  ];

  module.exports = { mockUsers, mockSongs, mockRecommendations };
