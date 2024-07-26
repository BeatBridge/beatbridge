require('dotenv').config();
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const querystring = require('querystring');
const fetch = require('node-fetch');
const authenticateJWT = require("../middlewares/authenticateJWT");
const { sendMail } = require('../utils/mailer');
const spotifyTokenRefresh = require('../middlewares/spotifyTokenRefresh');
const Replicate = require("replicate");
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const WebSocket = require('ws');


const WSPORT = process.env.WSPORT
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});


router.get('/latest-recommendation', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                recommendation: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
                spotifyAccessToken: true,
            }
        });

        const fetchArtistImageUrl = async (artistName) => {
            const searchResponse = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist`, {
                headers: {
                    'Authorization': `Bearer ${user.spotifyAccessToken}`
                }
            });

            const searchData = await searchResponse.json();
            const artistImageUrl = searchData.artists.items[0]?.images[0]?.url || '';
            return artistImageUrl;
        };

        if (!user || !user.recommendation.length) {
            const accessToken = user.spotifyAccessToken;
            if (!accessToken) {
                throw new Error('Spotify access token is missing or invalid');
            }

            const fetchViralSongs = async () => {
                const playlistId = '37i9dQZEVXbLiRSasKsNU9'; // Viral 50 Global playlist ID
                const spotifyResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (!spotifyResponse.ok) {
                    throw new Error('Failed to fetch viral songs from Spotify');
                }

                return await spotifyResponse.json();
            };

            let spotifyData;
            try {
                spotifyData = await fetchViralSongs();
            } catch (error) {
                console.error('Error fetching viral songs from Spotify:', error);

                // Fallback recommendation logic
                return res.status(500).json({ error: 'Failed to fetch viral songs and no previous recommendations available.' });
            }

            const viralTrack = spotifyData.tracks.items[0];
            const artistName = viralTrack.track.artists[0].name;
            const artistImageUrl = await fetchArtistImageUrl(artistName);

            return res.json({
                artistName,
                trackName: viralTrack.track.name,
                imageUrl: artistImageUrl,
                reason: `This is one of the top viral songs on Spotify right now: "${viralTrack.track.name}" by ${artistName}`,
                isDbRecommendation: false // Indicates that the recommendation is not from the DB
            });
        }

        const latestRecommendation = user.recommendation[0];

        const artistImageUrl = await fetchArtistImageUrl(latestRecommendation.artistName);

        res.json({
            artistName: latestRecommendation.artistName,
            imageUrl: artistImageUrl,
            reason: latestRecommendation.reason,
            isDbRecommendation: true
        });
    } catch (error) {
        console.error('Error fetching latest recommendation:', error);
        res.status(500).json({ error: 'Failed to fetch latest recommendation.' });
    }
});

router.post('/generate-recommendation', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const { preferences, threshold } = req.body; // Get dynamic weights and threshold from request body

        await calculateRecommendations({ ...preferences, threshold });

        const latestRecommendation = await prisma.recommendation.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        const artistImageUrl = await fetchArtistImageUrl(latestRecommendation.artistName);

        res.json({
            artistName: latestRecommendation.artistName,
            imageUrl: artistImageUrl,
            reason: latestRecommendation.reason,
            isDbRecommendation: true // Indicate that this is from the database
        });
    } catch (error) {
        console.error('Error generating recommendation:', error);
        res.status(500).json({ error: 'Failed to generate recommendation.' });
    }
});

router.get('/recommendation-history', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;

        const recommendations = await prisma.recommendation.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        const fetchArtistImageUrl = async (artistName) => {
            const searchResponse = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist`, {
                headers: {
                    'Authorization': `Bearer ${user.spotifyAccessToken}`
                }
            });

            const searchData = await searchResponse.json();
            const artistImageUrl = searchData.artists.items[0]?.images[0]?.url || '';
            return artistImageUrl;
        };

        const recommendationsWithImages = await Promise.all(recommendations.map(async (rec) => {
            const artistImageUrl = await fetchArtistImageUrl(rec.artistName);
            return {
                ...rec,
                imageUrl: artistImageUrl,
            };
        }));

        res.json(recommendationsWithImages);
    } catch (error) {
        console.error('Error fetching recommendation history:', error);
        res.status(500).json({ error: 'Failed to fetch recommendation history.' });
    }
});

router.post('/recommendation-feedback', authenticateJWT, async (req, res) => {
    try {
        const { recommendationId, feedback } = req.body;

        await prisma.recommendation.update({
            where: { id: recommendationId },
            data: { feedback },
        });

        res.status(200).json({ message: 'Feedback submitted successfully.' });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ error: 'Failed to submit feedback.' });
    }
});

module.exports = router;
