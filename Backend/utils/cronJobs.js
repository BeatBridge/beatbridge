const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fetch = require('node-fetch');

cron.schedule('0 * * * *', async () => {
    console.log('Running cron job to fetch Spotify data...');
    const users = await prisma.user.findMany({
        where: {spotifyAccessToken: { not: null } }
    });

    for (const user of users) {
        try {
            const artistResponse = await fetch('https://api.spotify.com/v1/me/top/artists', {
                headers: { 'Authorization': `Bearer ${user.spotifyAccessToken}` }
            });
            const topArtists = await artistResponse.json();

            const trackResponse = await fetch('https://api.spotify.com/v1/me/top/tracks', {
                headers: { 'Authorization': `Bearer ${user.spotifyAccessToken}` }
            })
            const topTracks = await trackResponse.json();

            await prisma.user.update({
                where: {id: user.id },
                data: {
                    topArtists: JSON.stringify(topArtists.items),
                    topTracks: JSON.stringify(topTracks.items),
                },
            });
        } catch (error) {
            console.error(`Failed to fetch Spotify data for user ${user.id}:`, error)
        }
    }
});
