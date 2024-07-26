require('dotenv').config();
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authenticateJWT = require("../middlewares/authenticateJWT");


router.get('/genres', authenticateJWT, async (req, res) => {
    try {
        const artists = await prisma.artist.findMany({
            select: {
                spotifyId: true,
                name: true,
                genres: true,
            }
        });
        res.json(artists);
    } catch (error) {
        console.error('Error fetching artist genres:', error);
        res.status(500).json({ error: "Failed to fetch artist genres." });
    }
});

router.get('/least-popular', authenticateJWT, async (req, res) => {
    const { skip = 0, take = 10 } = req.query;
    try {
      const artists = await prisma.artist.findMany({
        orderBy: { popularity: 'asc' },
        skip: parseInt(skip),
        take: parseInt(take),
      });
      res.json(artists);
    } catch (error) {
      console.error('Error fetching least popular artists:', error);
      res.status(500).json({ error: 'Failed to fetch least popular artists.' });
    }
});

module.exports = router;
