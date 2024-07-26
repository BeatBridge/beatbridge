require('dotenv').config();
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fetch = require('node-fetch');
const authenticateJWT = require("../middlewares/authenticateJWT");
const spotifyTokenRefresh = require('../middlewares/spotifyTokenRefresh');


router.get('/playlists', authenticateJWT, async (req, res) => {
    try {
        const playlists = await prisma.playlist.findMany();
        res.json(playlists);
    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).json({ error: "Failed to fetch playlists." });
    }
});

router.get('/playlists/:playlistId/tracks', authenticateJWT, spotifyTokenRefresh, async (req, res) => {
    const { playlistId } = req.params;

    try {
        const tracks = await prisma.track.findMany({
            where: { playlistId: parseInt(playlistId) },
            include: {
                artists: true,
            }
        });
        res.json(tracks);
    } catch (error) {
        console.error('Error fetching tracks:', error);
        res.status(500).json({ error: "Failed to fetch tracks." });
    }
});

router.get('/public-top-playlists', async (req, res) => {
    try {
        const topPlaylists = await prisma.playlist.findMany({
            include: {
                tracks: true,
            },
            orderBy: {
                tracks: {
                    _count: 'desc',
                },
            },
            take: 4,
        });

        res.json(topPlaylists);
    } catch (error) {
        console.error('Error fetching top playlists:', error);
        res.status(500).json({ error: "Failed to fetch top playlists." });
    }
});

router.get('/playlist-followers/:playlistId', authenticateJWT, async (req, res) => {
    const { playlistId } = req.params;
    const user = await prisma.user.findUnique({
      where: { username: req.user.username },
    });

    if (!user || !user.spotifyAccessToken) {
      return res.status(401).json({ error: 'Spotify access token is missing' });
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        headers: {
          'Authorization': `Bearer ${user.spotifyAccessToken}`
        }
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed to fetch playlist data' });
      }

      const data = await response.json();
      res.json({ followerCount: data.followers.total });
    } catch (error) {
      console.error('Error fetching playlist followers count:', error);
      res.status(500).json({ error: 'Failed to fetch playlist followers count' });
    }
});

module.exports = router;
