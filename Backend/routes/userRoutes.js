require('dotenv').config();
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const querystring = require('querystring');
const fetch = require('node-fetch');
const authenticateJWT  = require("../middlewares/authenticateJWT");
const { sendMail } = require('../utils/mailer');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

router.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });
        const verificationToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
        const verificationUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;
        const emailText = `Hello ${user.username}, please verify your email by clicking on the link: ${verificationUrl}`;

        sendMail(user.email, 'Verify your email', emailText);

        res.status(201).json({ user, message: 'User created. Please verify your email.' });
    } catch (error) {
        res.status(500).json({ error: 'User could not be created.' });
    }
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (user === null) {
            return res.status(403).json({ "status": "bad username/password" });
        }
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.status(201).json({ "status": "logged in", "token": token });
        } else {
            return res.status(403).json({ "status": "bad username/password" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.post('/verify-email', async (req, res) => {
    const { token } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.update({
            where: { id: decoded.id },
            data: { isVerified: true },
        });

        res.status(200).json({ message: 'Email verified successfully.' });
    } catch (error) {
        res.status(400).json({ error: 'Invalid or expired token.' });
    }
});

router.get("/info", authenticateJWT, async (req, res) => {
    const userInfo = await prisma.user.findUnique({
        where: { username: req.user.username },
    });

    if (userInfo === null) {
        return res.status(404).json({ error: "User not found" });
    }

    return res.json(userInfo);
});

router.get('/spotify/login', authenticateJWT, (req, res) => {
    const scopes = 'user-top-read user-read-private';
    const authUrl = 'https://accounts.spotify.com/authorize?' + querystring.stringify({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: scopes,
        redirect_uri: REDIRECT_URI,
    });
    res.redirect(authUrl);
});

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

        const token = jwt.sign({ id: user.id, username: user.username}, process.env.JWT_SECRET, { expiresIn: '1h'});
        res.cookie('jwt', token, {httpOnly: true, secure: true});
    } catch (error) {
        console.error(error);
        res.redirect(`/error`);
    }
});

router.get('/spotify/top-artists', authenticateJWT, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { email: req.user.email },
    });

    if (!user || !user.spotifyAccessToken) {
        return res.status(400).json({error: 'User not found or no Spotify acess token available.'});
    }

    try {
        const response = await fetch('https://api.spotify.com/v1/me/top/artists', {
            headers: {
                'Authorization': `Bearer ${user.spotifyAccessToken}`
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch top artists:`, response.statusText);
            return res.status(response.status).json({error : 'Failed to fetch top artists from Spotify.'})
        }
        const data = await express.response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching top artists:', error);
        res.status(500).json({error: "Failed to fetch top artists."});
    }
});

router.get('/spotify/top-tracks', authenticateJWT, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { email: req.user.email },
    });

    if (!user || !user.spotifyAccessToken) {
        return res.status(400).json({error: 'User not found or no Spotify acess token available.'});
    }

    try {
        const response = await fetch('https://api.spotify.com/v1/me/top/tracks', {
            headers: {
                'Authorization': `Bearer ${user.spotifyAccessToken}`
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch top artists:`, response.statusText);
            return res.status(response.status).json({error : 'Failed to fetch top tracks from Spotify.'})
        }
        const data = await express.response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching top artists:', error);
        res.status(500).json({error: "Failed to fetch top tracks."});
    }
});

router.get('/spotify/global-top-50', authenticateJWT, async (req, res) => {
    const playlistId = '37i9dQZEVXbMDoHDwVN2tF';

    const user = await prisma.user.findUnique({
        where: { username: req.user.username },
    });

    if (!user || !user.spotifyAccessToken) {
        return res.status(400).json({ error: 'User not found or no Spotify access token available.' });
    }

    try {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            headers: {
                'Authorization': `Bearer ${user.spotifyAccessToken}`
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch global top 50:`, response.statusText);
            return res.status(response.status).json({ error: 'Failed to fetch global top 50 from Spotify.' });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching global top 50:', error);
        res.status(500).json({ error: "Failed to fetch global top 50." });
    }
});

router.get('/spotify/viral-50-global', authenticateJWT, async (req, res) => {
    const playlistId = '37i9dQZEVXbLiRSasKsNU9';

    const user = await prisma.user.findUnique({
        where: { username: req.user.username },
    });

    if (!user || !user.spotifyAccessToken) {
        return res.status(400).json({ error: 'User not found or no Spotify access token available.' });
    }

    try {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            headers: {
                'Authorization': `Bearer ${user.spotifyAccessToken}`
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch viral 50 global:`, response.statusText);
            return res.status(response.status).json({ error: 'Failed to fetch viral 50 global from Spotify.' });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching viral 50 global:', error);
        res.status(500).json({ error: "Failed to fetch viral 50 global." });
    }
});

module.exports = router;
