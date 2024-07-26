require('dotenv').config();
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authenticateJWT = require("../middlewares/authenticateJWT");

router.get('/genres-by-location', async (req, res) => {
    try {
        const locations = await prisma.location.findMany({
            select: {
                id: true,
                name: true,
                latitude: true,
                longitude: true,
                countryCode: true,
                artists: {
                    select: {
                        genres: true
                    }
                }
            }
        });

        const result = locations.map(location => {
            const genres = Array.from(new Set(location.artists.flatMap(artist => artist.genres)));
            return {
                id: location.id,
                name: location.name,
                latitude: location.latitude,
                longitude: location.longitude,
                countryCode: location.countryCode,
                genres
            };
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching genres by location:', error);
        res.status(500).json({ error: "Failed to fetch genres by location." });
    }
});

router.get('/users', authenticateJWT, async (req, res) => {
    const userId = parseInt(req.query.userId, 10);

    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid userId' });
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                id: {
                    not: userId
                },
                username: {
                    not: "system"
                }
            },
            select: {
                id: true,
                username: true,
                email: true,
                profilePicture: true
            }
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.get('/protected-route', authenticateJWT, (req, res) => {
    res.json({ message: 'This is a protected route' });
});

module.exports = router;
