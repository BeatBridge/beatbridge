require('dotenv').config({ path: __dirname + '/../.env' });
const WebSocket = require('ws');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const WSPORT = process.env.WSPORT;
const wss = new WebSocket.Server({ port: `${WSPORT}` });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', async (data) => {
        const message = JSON.parse(data);

        // Save message to database and include sender's username
        const savedMessage = await prisma.directMessage.create({
            data: {
                senderId: message.senderId,
                receiverId: message.receiverId,
                content: message.content,
            },
            include: {
                sender: {
                    select: {
                        username: true,
                    },
                },
            },
        });

        // Broadcast the message to all connected clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(savedMessage));
            }
        });
    });

    ws.send('Connected to WebSocket server');
});

console.log(`WebSocket server is running on ws://localhost:${WSPORT}`);
