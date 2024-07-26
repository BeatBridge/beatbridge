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

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const WSPORT = process.env.WSPORT
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

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

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const resetToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const emailText = `Hello, please reset your password by clicking on the link: ${resetUrl}`;

        await sendMail(user.email, 'Password Reset', emailText);

        res.status(200).json({ message: 'Password reset email sent.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: decoded.id },
            data: { password: hashedPassword },
        });

        res.status(200).json({ message: 'Password reset successfully.' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Invalid or expired token.' });
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

router.post('/upload-profile-picture', authenticateJWT, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        await prisma.user.update({
            where: { id: req.user.id },
            data: { profilePicture: req.file.buffer },
        });

        res.status(200).json({ message: 'Profile picture uploaded successfully' });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ error: 'Failed to upload profile picture' });
    }
});

router.get("/info", authenticateJWT, async (req, res) => {
    const userInfo = await prisma.user.findUnique({
        where: { username: req.user.username },
        select: {
            id:  true,
            username: true,
            email: true,
            isPremium: true,
            spotifyAccessToken: true
        }
    });

    if (userInfo === null) {
        return res.status(404).json({ error: "User not found" });
    }

    return res.json(userInfo);
});

// Route to get profile picture
router.get('/profile-picture/:userId', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(req.params.userId) },
            select: { profilePicture: true },
        });

        if (!user || !user.profilePicture) {
            // Send a default profile picture if not found
            const defaultProfilePicturePath = path.join(__dirname, '..', '..', 'src', 'assets', 'upsidedownpfp.jpg');
            return res.sendFile(defaultProfilePicturePath);
        }

        res.set('Content-Type', 'image/jpeg'); // appropriate picture type
        res.send(user.profilePicture);
    } catch (error) {
        console.error('Error fetching profile picture:', error);
        res.status(500).json({ error: 'Failed to fetch profile picture' });
    }
});


router.put("/update-profile", authenticateJWT, async (req, res) => {
    const { username, email } = req.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: { username, email },
        });
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

router.post('/update-password', authenticateJWT, async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'New passwords do not match' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: req.user.id },
            data: { password: hashedPassword }
        });

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Failed to update password' });
    }
});

router.get('/spotify/login', authenticateJWT, (req, res) => {
    const state = jwt.sign({ id: req.user.id, username: req.user.username }, process.env.JWT_SECRET, { expiresIn: '10m' });
    const scopes = 'user-top-read user-read-private';
    const authUrl = 'https://accounts.spotify.com/authorize?' + querystring.stringify({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: scopes,
        redirect_uri: REDIRECT_URI,
        state: state
    });
    res.redirect(authUrl);
});

router.get('/spotify/callback', async (req, res) => {
    const { code, state } = req.query;

    try {
        const decodedState = jwt.verify(state, process.env.JWT_SECRET);

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

        const response = await fetch(authOptions.url, {
            method: authOptions.method,
            body: authOptions.body,
            headers: authOptions.headers
        });

        const data = await response.json();
        const accessToken = data.access_token;
        const refreshToken = data.refresh_token;

        await prisma.user.update({
            where: { id: decodedState.id },
            data: { spotifyAccessToken: accessToken, spotifyRefreshToken: refreshToken },
        });

        const confirmationUrl = `${process.env.FRONTEND_URL}/spotify-confirmation?token=${state}`;
        res.redirect(confirmationUrl);
    } catch (error) {
        console.error('Error during Spotify callback:', error);
        res.redirect(`/error`);
    }
});

router.post('/spotify/confirm', async (req, res) => {
    const { token } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (user) {
            res.json({ status: 'success' });
        } else {
            res.status(400).json({ error: 'Invalid token or user not found' });
        }
    } catch (error) {
        console.error('Error verifying Spotify login:', error);
        res.status(500).json({ error: 'Failed to verify Spotify login' });
    }
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
        return res.json(user);
    } catch (error) {
        console.error(error);
        res.redirect(`/error`);
    }
});

router.get('/spotify/global-top-50', authenticateJWT, spotifyTokenRefresh, async (req, res) => {
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

router.get('/spotify/viral-50-global', authenticateJWT, spotifyTokenRefresh, async (req, res) => {
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

router.get('/spotify/search', authenticateJWT, spotifyTokenRefresh, async (req, res) => {
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
router.get('/spotify/featured-playlists', authenticateJWT, spotifyTokenRefresh, async (req, res) => {
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

router.get('/spotify/playlists/:playlistId/tracks', authenticateJWT, spotifyTokenRefresh, async (req, res) => {
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

router.get('/spotify/tracks', authenticateJWT, spotifyTokenRefresh, async (req, res) => {
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

router.get('/spotify/artists', authenticateJWT, spotifyTokenRefresh, async (req, res) => {
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
                imageUrl: true
            }
        });

        const dbArtistImages = dbArtists.reduce((acc, artist) => {
            acc[artist.spotifyId] = artist.imageUrl;
            return acc;
        }, {});

        const missingArtistIds = artistIds.filter(id => !dbArtistImages[id]);

        if (missingArtistIds.length === 0) {
            return res.json({ artists: dbArtistImages });
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

        const apiArtistImages = data.artists.reduce((acc, artist) => {
            const imageUrl = artist.images.length > 0 ? artist.images[0].url : null;
            acc[artist.id] = imageUrl;

            // Update the database
            prisma.artist.update({
                where: { spotifyId: artist.id },
                data: { imageUrl }
            }).catch(err => console.error('Error updating artist image in database:', err));

            return acc;
        }, {});

        res.json({ artists: { ...dbArtistImages, ...apiArtistImages } });
    } catch (error) {
        console.error('Error fetching artist details:', error);
        res.status(500).json({ error: "Failed to fetch artist details." });
    }
});

//cronJob
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

router.get('/artists/genres', authenticateJWT, async (req, res) => {
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

router.post('/songs', authenticateJWT, async (req, res) => {
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

router.post('/songs/:songId/tags', authenticateJWT, async (req, res) => {
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

router.get('/songs', authenticateJWT, async (req, res) => {
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

router.get('/songs/:songId', authenticateJWT, spotifyTokenRefresh, async (req, res) => {
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

router.delete('/songs/:id', authenticateJWT, async (req, res) => {
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

router.put('/songs/:songId', authenticateJWT, async (req, res) => {
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

router.post('/track-artist-search', authenticateJWT, async (req, res) => {
    const { artistSpotifyId } = req.body;

    try {
        // Find the artist by Spotify ID
        const artist = await prisma.artist.findUnique({
            where: { spotifyId: artistSpotifyId },
        });

        if (!artist) {
            return res.status(404).json({ error: 'Artist not found' });
        }

        // Use the artist's database ID
        await prisma.artistSearch.create({
            data: {
                artistId: artist.id,  // Use the integer ID
            }
        });

        res.status(201).json({ message: 'Artist search tracked successfully' });
    } catch (error) {
        console.error('Error tracking artist search:', error);
        res.status(500).json({ error: 'Failed to track artist search' });
    }
});

router.get('/trending-artists', authenticateJWT, async (req, res) => {
    try {
        const trendingArtists = await prisma.trendingArtist.findMany({
            include: {
                artist: true,
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 5
        });

        res.json(trendingArtists);
    } catch (error) {
        console.error('Error fetching trending artists:', error);
        res.status(500).json({ error: 'Failed to fetch trending artists.' });
    }
});

router.get('/trending-artists-momentum', authenticateJWT, async (req, res) => {
    try {
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const momentumData = await prisma.trendingArtist.findMany({
            where: {
                date: {
                    gte: twoWeeksAgo
                }
            },
            include: {
                artist: true
            },
            orderBy: {
                momentum: 'desc' // Sort by momentum descending
            },
            take: 5 // Limit to the top 5 artists
        });

        res.json(momentumData);
    } catch (error) {
        console.error('Error fetching trending artists momentum:', error);
        res.status(500).json({ error: 'Failed to fetch trending artists momentum.' });
    }
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

router.get('/artists/least-popular', authenticateJWT, async (req, res) => {
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

router.post('/chat-with-ai',authenticateJWT,  async (req, res) => {
    const { prompt } = req.body;
    const {id} = req.user;

    const contextPath = path.join(__dirname, '../utils/context.txt');
    const context = fs.readFileSync(contextPath, 'utf8');

    const input = {
        top_k: 50,
        top_p: 0.9,
        prompt,
        max_tokens: 512,
        min_tokens: 0,
        temperature: 0.6,
        prompt_template: `system\n\nYou are an AI assistant specialized in helping users with the BeatBridge application(context: ${context}) User\n\n{prompt}Assistant\n\n`,
        presence_penalty: 1.15,
        frequency_penalty: 0.2,
    };

    try {
        let responseData = "";

        for await (const event of replicate.stream(
            "meta/meta-llama-3-70b-instruct",
            { input }
        )) {
            responseData += event.toString();
        }
        await prisma.chatMessage.create({
            data: {
                text: prompt,
                userId: id,
                response: responseData
            }
        });

       return res.status(201).send(responseData);
    } catch (error) {
        console.error("Error in chat process:", error);
        res.status(500).send("Error in chat process.");
    }
});

router.post('/chat-message', authenticateJWT, async (req, res) => {
    const { text } = req.body;
    const userId = req.user.id;

    try {
        const chatMessage = await prisma.chatMessage.create({
            data: {
                text,
                userId
            }
        });
        res.status(201).json(chatMessage);
    } catch (error) {
        console.error('Error saving chat message:', error);
        res.status(500).json({ error: 'Failed to save chat message.' });
    }
});

router.get('/chat-messages', authenticateJWT, async (req, res) => {
    const userId = req.user.id;

    try {
        const chatMessages = await prisma.chatMessage.findMany({
            where: { userId },
            include: {
                user: true
            },
            orderBy: { createdAt: 'asc' }
        });
        return res.json(chatMessages);
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        res.status(500).json({ error: 'Failed to fetch chat messages.' });
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

router.get('/users', authenticateJWT, async (req, res) => {
    const userId = parseInt(req.query.userId, 10);

    console.log('Parsed userId from query parameters:', userId);

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

router.get('/messages/:userId/:otherUserId', async (req, res) => {
    const { userId, otherUserId } = req.params;
    try {
        const messages = await prisma.directMessage.findMany({
            where: {
                OR: [
                    { senderId: parseInt(userId), receiverId: parseInt(otherUserId) },
                    { senderId: parseInt(otherUserId), receiverId: parseInt(userId) },
                ],
            },
            orderBy: {
                createdAt: 'asc',
            },
            include: {
                sender: {
                    select: {
                        username: true,
                    },
                },
            },
        });
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

router.post('/messages', async (req, res) => {
    const { senderId, receiverId, content } = req.body;
    try {
        const message = await prisma.directMessage.create({
            data: {
                senderId,
                receiverId,
                content,
            },
        });

        const ws = new WebSocket(`ws://localhost:${WSPORT}`);
        ws.on('open', () => {
            ws.send(JSON.stringify(message));
            ws.close();
        });

        res.json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

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

router.get('/protected-route', authenticateJWT, (req, res) => {
    res.json({ message: 'This is a protected route' });
});

module.exports = router;
