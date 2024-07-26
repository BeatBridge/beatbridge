require('dotenv').config();
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const WebSocket = require('ws');


const WSPORT = process.env.WSPORT

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

module.exports = router;
