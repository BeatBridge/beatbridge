const fetch = require('node-fetch');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { refreshSpotifyToken } = require('../utils/spotifyUtils');

async function spotifyTokenRefresh(req, res, next) {
    const username = req.user.username;

    try {
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            return res.status(400).json({ error: 'User not found.' });
        }

        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: { 'Authorization': `Bearer ${user.spotifyAccessToken}` }
        });

        if (response.status === 401) {
            const newAccessToken = await refreshSpotifyToken(username);
            await prisma.user.update({
                where: { username },
                data: { spotifyAccessToken: newAccessToken }
            });
            user.spotifyAccessToken = newAccessToken;
        }

        next();
    } catch (error) {
        console.error('Error in Spotify token refresh middleware:', error);
        res.status(500).json({ error: "Failed to refresh Spotify token.", details: error.message });
    }
}

module.exports = spotifyTokenRefresh;
