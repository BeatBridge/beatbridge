require('dotenv').config();
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const querystring = require('querystring');
const fetch = require('node-fetch');
const authenticateJWT = require("../middlewares/authenticateJWT");
const spotifyTokenRefresh = require('../middlewares/spotifyTokenRefresh');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

router.post('/create-access-token', authenticateJWT, async (req, res) => {
    const code = req.body.code || null;
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        method: 'POST',
        body: querystring.stringify({
            code: code,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code',
        }),
        headers: {
            'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    try {
        const response = await fetch(authOptions.url, {
            method: authOptions.method,
            body: authOptions.body,
            headers: authOptions.headers
        });
        const data = await response.json();
        const accessToken = data.access_token;
        const refreshToken = data.refresh_token;

        // Save tokens in database for the user
        const user = await prisma.user.update({
            where: { username: req.user.username },
            data: { spotifyAccessToken: accessToken, spotifyRefreshToken: refreshToken },
        });
        return res.json(user);
    } catch (error) {
        console.error(error);
        res.redirect(`/error`);
    }
});

router.get('/global-top-50', authenticateJWT, spotifyTokenRefresh, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { username: req.user.username },
    });
    try {
        const playlistId = '37i9dQZEVXbMDoHDwVN2tF';
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            headers: {
                'Authorization': `Bearer ${user.spotifyAccessToken}`
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching global top 50:', error);
        res.status(500).json({ error: "Failed to fetch global top 50." });
    }
});

router.get('/viral-50-global', authenticateJWT, spotifyTokenRefresh, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { username: req.user.username },
    });
    try {
        const response = await fetch(`https://api.spotify.com/v1/playlists/37i9dQZEVXbLiRSasKsNU9`, {
            headers: {
                'Authorization': `Bearer ${user.spotifyAccessToken}`
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching viral 50 global:', error);
        res.status(500).json({ error: "Failed to fetch viral 50 global." });
    }
});

router.get('/search', authenticateJWT, spotifyTokenRefresh, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { username: req.user.username },
    });

    const query = req.query.q;
    const type = 'track';
    const url = `https://api.spotify.com/v1/search?q=${query}&type=${type}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${user.spotifyAccessToken}`
            }
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error searching songs:', error);
        res.status(500).json({ error: 'Failed to search songs.' });
    }
});

//Direct API call
router.get('/featured-playlists', authenticateJWT, spotifyTokenRefresh, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { username: req.user.username },
    });

    try {
        const response = await fetch(`https://api.spotify.com/v1/browse/featured-playlists`, {
            headers: {
                'Authorization': `Bearer ${user.spotifyAccessToken}`
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching featured playlists:', error);
        res.status(500).json({ error: "Failed to fetch featured playlists." });
    }
});

router.get('/playlists/:playlistId/tracks', authenticateJWT, spotifyTokenRefresh, async (req, res) => {
    const { playlistId } = req.params;
    const user = await prisma.user.findUnique({
        where: { username: req.user.username },
    });

    try {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            headers: {
                'Authorization': `Bearer ${user.spotifyAccessToken}`
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching playlist tracks:', error);
        res.status(500).json({ error: "Failed to fetch playlist tracks." });
    }
});

router.get('/tracks', authenticateJWT, spotifyTokenRefresh, async (req, res) => {
    const { trackIds } = req.query;
    const user = await prisma.user.findUnique({
        where: { username: req.user.username },
    });

    if (!trackIds) {
        return res.status(400).json({ error: 'No track IDs provided.' });
    }

    try {
        const response = await fetch(`https://api.spotify.com/v1/tracks?ids=${trackIds}`, {
            headers: {
                'Authorization': `Bearer ${user.spotifyAccessToken}`
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching track details:', error);
        res.status(500).json({ error: "Failed to fetch track details." });
    }
});

router.get('/artists', authenticateJWT, spotifyTokenRefresh, async (req, res) => {
    const artistIds = req.query.artistIds ? req.query.artistIds.split(',') : [];
    if (artistIds.length === 0) {
        return res.status(400).json({ error: 'No artist IDs provided.' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const dbArtists = await prisma.artist.findMany({
            where: {
                spotifyId: { in: artistIds }
            },
            select: {
                spotifyId: true,
                name: true,
                imageUrl: true
            }
        });

        const dbArtistImages = dbArtists.reduce((acc, artist) => {
            acc[artist.spotifyId] = { name: artist.name, imageUrl: artist.imageUrl };
            return acc;
        }, {});

        const missingArtistIds = artistIds.filter(id => !dbArtistImages[id]);

        if (missingArtistIds.length === 0) {
            return res.json({ artists: dbArtists.map(artist => ({ id: artist.spotifyId, name: artist.name, imageUrl: artist.imageUrl })) });
        }

        const response = await fetch(`https://api.spotify.com/v1/artists?ids=${missingArtistIds.join(',')}`, {
            headers: {
                'Authorization': `Bearer ${user.spotifyAccessToken}`
            }
        });

        if (response.status === 429) {
            console.warn('Backend: Rate limited by Spotify API');
            return res.status(429).json({ error: 'Backend: Rate limited by Spotify API' });
        }

        const data = await response.json();

        if (!response.ok) {
            console.error('Error fetching artist details:', data);
            return res.status(response.status).json({ error: data.error || "Failed to fetch artist details." });
        }

        const apiArtistImages = data.artists.map(artist => {
            const imageUrl = artist.images.length > 0 ? artist.images[0].url : null;

            // Check if the artist exists in the database
            const existingArtist = prisma.artist.findUnique({
                where: { spotifyId: artist.id }
            });

            if (existingArtist) {
                // Update the existing artist's image
                prisma.artist.update({
                    where: { spotifyId: artist.id },
                    data: { imageUrl }
                }).catch(err => console.error('Error updating artist image in database:', err));
            } else {
                // Create a new artist record
                prisma.artist.create({
                    data: {
                        spotifyId: artist.id,
                        name: artist.name,
                        genres: artist.genres,
                        popularity: artist.popularity,
                        followerCount: artist.followers.total,
                        imageUrl: imageUrl
                    }
                }).catch(err => console.error('Error creating artist in database:', err));
            }

            return { id: artist.id, name: artist.name, imageUrl };
        });

        res.json({ artists: [...dbArtists.map(artist => ({ id: artist.spotifyId, name: artist.name, imageUrl: artist.imageUrl })), ...apiArtistImages] });
    } catch (error) {
        console.error('Error fetching artist details:', error);
        res.status(500).json({ error: "Failed to fetch artist details." });
    }
});

module.exports = router;
