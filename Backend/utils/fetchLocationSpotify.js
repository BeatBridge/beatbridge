const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { refreshSpotifyToken } = require('./spotifyUtils');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options, retries = 3, delayMs = 1000) {
    try {
        const response = await fetch(url, options);
        if (response.status === 429) { // Too Many Requests
            if (retries > 0) {
                console.warn(`Rate limited. Retrying in ${delayMs} ms...`);
                await delay(delayMs);
                return fetchWithRetry(url, options, retries - 1, delayMs * 2);
            } else {
                throw new Error('Too many requests, retry limit reached');
            }
        }
        return response;
    } catch (error) {
        if (retries > 0) {
            console.warn(`Fetch error. Retrying in ${delayMs} ms...`);
            await delay(delayMs);
            return fetchWithRetry(url, options, retries - 1, delayMs * 2);
        } else {
            throw error;
        }
    }
}

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

async function fetchLocationFromSpotify(spotifyId) {
    const accessToken = await getSystemUserToken();

    const response = await fetchWithRetry(
        `https://api.spotify.com/v1/artists/${spotifyId}`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch location from Spotify for artist with ID ${spotifyId}`);
    }

    const data = await response.json();

    return {
        name: data.name,
        latitude: 0,
        longitude: 0
    };
}

module.exports = { fetchLocationFromSpotify };
