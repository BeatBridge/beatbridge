require('dotenv').config();
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authenticateJWT = require("../middlewares/authenticateJWT");
const Replicate = require("replicate");
const fs = require('fs');
const path = require('path');

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
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

module.exports = router;
