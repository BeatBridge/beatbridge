const cron = require('node-cron');
const { fetchAndStoreFeaturedPlaylists, fetchAndStoreTracksAndArtists, fetchAndStoreArtistGenres } = require('./cronJobMap');
const { calculateRecommendations } = require('./cronJobRecommendation')
const { calculateTrendingArtists, cleanupOldRecords } = require('./cronJobTrendingArtists')
const { updateArtistImages } = require('./cronJobUpdateArtistImages');

// Calculate recommendation every 3 hours
cron.schedule('0 3 * * *', async () => {
    await calculateRecommendations();
});

// Schedule a cron job that runs every day at 10am
cron.schedule('0 10 * * *', async () => {
    await fetchAndStoreFeaturedPlaylists();
    await fetchAndStoreTracksAndArtists();
    await fetchAndStoreArtistGenres();
});


// Schedule a cron job to calculate trending artists every day at 10am
cron.schedule('0 10 * * *', async () => {
    await calculateTrendingArtists();
});

// Cleanup old records (older than 2 weeks) at 11am everyday
cron.schedule('0 11 * * *', async () => {
    await cleanupOldRecords();
});

// Schedule a cron job to update artist images every day at 11am
cron.schedule('0 11 * * *', async () => {
    await updateArtistImages();
});
