require('dotenv').config();
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authenticateJWT = require("../middlewares/authenticateJWT");
const spotifyTokenRefresh = require('../middlewares/spotifyTokenRefresh');

router.get('/', authenticateJWT, async (req, res) => {
    try {
        const songs = await prisma.song.findMany({
            where: { userId: req.user.id },
            orderBy: { taggedAt: 'desc' }
        });
        res.json(songs);
    } catch (error) {
        console.error('Error fetching tagged songs:', error);
        res.status(500).json({ error: 'Failed to fetch tagged songs.' });
    }
});

router.post('/', authenticateJWT, async (req, res) => {
    const { title, artist, album, genre, mood, tempo, customTags, artistId } = req.body;
    try {
        const song = await prisma.song.create({
            data: {
                title,
                artist,
                album,
                genre,
                mood,
                tempo,
                customTags,
                artistId,
                userId: req.user.id
            }
        });
        res.json(song);
    } catch (error) {
        console.error('Error creating song:', error);
        res.status(500).json({ error: 'Failed to create song.' });
    }
});

router.get('/:songId', authenticateJWT, spotifyTokenRefresh, async (req, res) => {
    const { songId } = req.params;
    try {
        const song = await prisma.song.findUnique({
            where: { id: parseInt(songId) }
        });
        if (!song) {
            return res.status(404).json({ error: 'Song not found' });
        }
        res.json(song);
    } catch (error) {
        console.error('Error fetching song details:', error);
        res.status(500).json({ error: 'Failed to fetch song details.' });
    }
});

router.put('/:songId', authenticateJWT, async (req, res) => {
    const { songId } = req.params;
    const { genre, mood, tempo, customTags } = req.body;
    const userId = req.user.id;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const song = await prisma.song.findUnique({ where: { id: parseInt(songId) } });

        if (!song || song.userId !== userId) {
            return res.status(404).json({ error: 'Song not found or unauthorized' });
        }

        const updatedSong = await prisma.song.update({
            where: { id: parseInt(songId) },
            data: {
                genre,
                mood,
                tempo,
                customTags: JSON.stringify(customTags),
                taggedAt: new Date()
            }
        });

        res.json(updatedSong);
    } catch (error) {
        console.error('Error updating song tags:', error);
        res.status(500).json({ error: 'Failed to update song tags.' });
    }
});

router.delete('/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.song.delete({
            where: { id: parseInt(id) }
        });
        res.status(200).json({ message: 'Song deleted successfully' });
    } catch (error) {
        console.error('Error deleting song:', error);
        res.status(500).json({ error: 'Failed to delete song' });
    }
});

router.post('/:songId/tags', authenticateJWT, async (req, res) => {
    const { songId } = req.params;
    const { genre, mood, tempo, customTags } = req.body;
    const userId = req.user.id;

    const fetchSpotifyArtistId = async (artistName, accessToken) => {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        return data.artists.items[0]?.id || null;
    };

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const song = await prisma.song.findUnique({ where: { id: parseInt(songId) } });
        const artistName = song.artist;

        // Fetch artist ID from Spotify
        const artistId = await fetchSpotifyArtistId(artistName, user.spotifyAccessToken);

        // Update song with tags and artist ID
        const updatedSong = await prisma.song.update({
            where: { id: parseInt(songId) },
            data: {
                genre,
                mood,
                tempo,
                customTags: JSON.stringify(customTags),
                artistId,
                taggedAt: new Date()
            }
        });

        res.json(updatedSong);
    } catch (error) {
        console.error('Error saving tags:', error);
        res.status(500).json({ error: 'Failed to save tags.' });
    }
});

module.exports = router;
