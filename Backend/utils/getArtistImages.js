const fetchWithRetry = require('../utils/fetchWithRetry');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getArtistImages(artistId, accessToken) {
    const response = await fetchWithRetry(
        `https://api.spotify.com/v1/artists/${artistId}`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch images for artist ${artistId}:`, errorText);
        throw new Error(`Failed to fetch images for artist ${artistId}`);
    }

    const data = await response.json();
    return data.images;
}

module.exports = { getArtistImages };
