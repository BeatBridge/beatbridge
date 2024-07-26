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

        res.set('Content-Type', 'image/jpeg');
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

router.post('/track-artist-search', authenticateJWT, async (req, res) => {
    const { artistSpotifyId } = req.body;

    try {
        const artist = await prisma.artist.findUnique({
            where: { spotifyId: artistSpotifyId },
        });

        if (!artist) {
            return res.status(404).json({ error: 'Artist not found' });
        }

        await prisma.artistSearch.create({
            data: {
                artistId: artist.id,
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
                momentum: 'desc'
            },
            take: 5
        });

        res.json(momentumData);
    } catch (error) {
        console.error('Error fetching trending artists momentum:', error);
        res.status(500).json({ error: 'Failed to fetch trending artists momentum.' });
    }
});

module.exports = router;
