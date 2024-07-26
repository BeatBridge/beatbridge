const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { delay, fetchWithRetry } = require('./fetchWithRetry');
const { refreshSpotifyToken } = require('./spotifyUtils');
require('./createSystemUser.js');

async function getSystemUserToken() {
    const systemUser = await prisma.user.findUnique({
        where: { username: 'system' },
    });

    if (!systemUser) {
        throw new Error('System user not found.');
    }

    const response = await fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${systemUser.spotifyAccessToken}` }
    });

    if (response.status === 401 || !systemUser.spotifyAccessToken) {
        const newAccessToken = await refreshSpotifyToken('system');
        await prisma.user.update({
            where: { username: 'system' },
            data: { spotifyAccessToken: newAccessToken }
        });
        return newAccessToken;
    }

    return systemUser.spotifyAccessToken;
}

async function getArtistImages(artistId, accessToken) {
    const url = `https://api.spotify.com/v1/artists/${artistId}`;
    const response = await fetchWithRetry(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch artist images: ${errorText}`);
    }

    const artistData = await response.json();
    return artistData.images;
}

async function updateArtistImages() {
    const artists = await prisma.artist.findMany({
        where: { imageUrl: null }
    });

    const accessToken = await getSystemUserToken();

    for (const artist of artists) {
        try {
            const images = await getArtistImages(artist.spotifyId, accessToken);
            if (images.length > 0) {
                await prisma.artist.update({
                    where: { spotifyId: artist.spotifyId },
                    data: { imageUrl: images[0].url }
                });
            } else {
                console.warn(`No images found for artist ${artist.name}`);
            }
        } catch (error) {
            console.error(`Error updating image for artist ${artist.name}:`, error);
        }

        await delay(1000); // Delay for 1 second to avoid rate limiting
    }
}

module.exports = {
    updateArtistImages,
};
