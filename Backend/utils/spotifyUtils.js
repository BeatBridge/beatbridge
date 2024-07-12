const fetch = require('node-fetch');
const querystring = require('querystring');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function refreshSpotifyToken(username) {
    const user = await prisma.user.findUnique({
        where: { username },
    });

    if (!user || !user.spotifyRefreshToken) {
        throw new Error('No refresh token available');
    }

    const refreshOptions = {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token: user.spotifyRefreshToken
        })
    };

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', refreshOptions);
        const data = await response.json();
        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const updatedUser = await prisma.user.update({
            where: { username },
            data: {
                spotifyAccessToken: data.access_token,
                spotifyRefreshToken: data.refresh_token ? data.refresh_token : user.spotifyRefreshToken,
            },
        });
        return data.access_token;
    } catch (error) {
        console.error('Error refreshing Spotify token:', error);
        throw error;
    }
}

module.exports = { refreshSpotifyToken };
