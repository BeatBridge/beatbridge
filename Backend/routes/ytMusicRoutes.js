
require('dotenv').config();
const express = require("express");
const router = express.Router();
const fetch = require('node-fetch');
const authenticateJWT = require("../middlewares/authenticateJWT");


router.get('/youtube-music/search', authenticateJWT, async (req, res) => {
    const { trackName, artistName } = req.query;

    try {
        const query = `${trackName} ${artistName}`;
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&q=${encodeURIComponent(query)}&key=${process.env.YOUTUBE_API_KEY}`);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const track = data.items[0];
            const videoId = track.id.videoId;
            res.json({ videoId });
        } else {
            res.status(404).json({ error: 'Track not found on YouTube Music' });
        }
    } catch (error) {
        console.error('Error searching YouTube Music:', error);
        res.status(500).json({ error: 'Failed to search YouTube Music' });
    }
});

module.exports = router;
