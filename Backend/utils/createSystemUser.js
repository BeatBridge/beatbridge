require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

const SYSTEM_USER_REFRESH_TOKEN = process.env.SPOTIFY_SYSTEM_USER_REFRESH_TOKEN;

async function main() {
    const password = 'DefaultPass1234'
    const hashedPassword = await bcrypt.hash(password, 10);

    const systemUser = await prisma.user.upsert({
        where: { username: 'system' },
        update: {
            email: 'ayomidetestrun@gmail.com',
            password: hashedPassword,
            isVerified: true,
            spotifyAccessToken: null,
            spotifyRefreshToken: SYSTEM_USER_REFRESH_TOKEN,
        },
        create: {
            username: 'system',
            email: 'ayomidetestrun@gmail.com',
            password: hashedPassword,
            isVerified: true,
            spotifyAccessToken: null,
            spotifyRefreshToken: SYSTEM_USER_REFRESH_TOKEN,
        },
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
