const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fetch = require('node-fetch');
const { refreshSpotifyToken } = require('./spotifyUtils');
require('./createSystemUser.js');

async function getSystemUserToken() {
    const systemUser = await prisma.user.findUnique({
        where: { username: 'system' },
    });

    if (!systemUser) {
        throw new Error('System user not found.');
    }

    const response = await fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${systemUser.spotifyAccessToken}` }
    });

    if (response.status === 401 || !systemUser.spotifyAccessToken) {
        const newAccessToken = await refreshSpotifyToken('system');
        await prisma.user.update({
            where: { username: 'system' },
            data: { spotifyAccessToken: newAccessToken }
        });
        return newAccessToken;
    }

    return systemUser.spotifyAccessToken;
}

async function fetchAndStoreFeaturedPlaylists() {
    console.log('Fetching and storing featured playlists...');
    const accessToken = await getSystemUserToken();

    try {
        const response = await fetch(`https://api.spotify.com/v1/browse/featured-playlists`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await response.json();

        if (response.ok) {
            for (const playlist of data.playlists.items) {
                await prisma.playlist.upsert({
                    where: { spotifyId: playlist.id },
                    update: {
                        name: playlist.name,
                        description: playlist.description,
                        url: playlist.external_urls.spotify,
                        images: playlist.images,
                    },
                    create: {
                        spotifyId: playlist.id,
                        name: playlist.name,
                        description: playlist.description,
                        url: playlist.external_urls.spotify,
                        images: playlist.images,
                    }
                });
            }
            console.log(`Featured playlists updated`);
        } else {
            console.error(`Failed to fetch featured playlists:`, data);
        }
    } catch (error) {
        console.error('Error fetching featured playlists:', error);
    }
    console.log('Completed fetching and storing featured playlists.');
}

async function fetchAndStoreTracksAndArtists() {
    console.log('Fetching and storing tracks and artists...');
    const playlists = await prisma.playlist.findMany();
    const accessToken = await getSystemUserToken();

    for (const playlist of playlists) {
        try {
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist.spotifyId}/tracks`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                for (const item of data.items) {
                    const track = item.track;

                    const storedTrack = await prisma.track.upsert({
                        where: { spotifyId: track.id },
                        update: {
                            name: track.name,
                            album: track.album.name,
                            duration: track.duration_ms,
                            playlistId: playlist.id,
                        },
                        create: {
                            spotifyId: track.id,
                            name: track.name,
                            album: track.album.name,
                            duration: track.duration_ms,
                            playlistId: playlist.id,
                        }
                    });

                    for (const artist of track.artists) {
                        const storedArtist = await prisma.artist.upsert({
                            where: { spotifyId: artist.id },
                            update: {
                                name: artist.name,
                            },
                            create: {
                                spotifyId: artist.id,
                                name: artist.name,
                                genres: [],
                            }
                        });

                        // Link track to artist
                        await prisma.track.update({
                            where: { id: storedTrack.id },
                            data: {
                                artists: {
                                    connect: { id: storedArtist.id }
                                }
                            }
                        });
                    }
                }
                console.log(`Tracks and artists updated for playlist ${playlist.id}`);
            } else {
                console.error(`Failed to fetch tracks for playlist ${playlist.id}:`, data);
            }
        } catch (error) {
            console.error('Error fetching tracks:', error);
        }
    }
    console.log('Completed fetching and storing tracks and artists.');
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAndStoreArtistGenres() {
    console.log('Fetching and storing artist genres...');
    const artists = await prisma.artist.findMany({
        where: { genres: { equals: [] } }
    });

    const accessToken = await getSystemUserToken();

    for (const artist of artists) {
        try {
            const response = await fetch(`https://api.spotify.com/v1/artists/${artist.spotifyId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to fetch genres for artist ${artist.spotifyId}:`, errorText);
                await delay(1000); // Delay for 1 second before the next request
                continue; // Skip this artist and continue with the next
            }

            const data = await response.json();

            await prisma.artist.update({
                where: { spotifyId: artist.spotifyId },
                data: { genres: data.genres }
            });

            console.log(`Genres updated for artist ${artist.name}`);
        } catch (error) {
            console.error(`Error fetching genres for artist ${artist.name}:`, error);
        }

        await delay(1000); // Delay for 1 second before the next request
    }

    console.log('Completed fetching and storing artist genres.');
}

cron.schedule('0 * * * *', async () => {
    console.log('Cron job started: Running cron job to fetch Spotify data...');
    await fetchAndStoreFeaturedPlaylists();
    await fetchAndStoreTracksAndArtists();
    await fetchAndStoreArtistGenres();
    console.log('Cron job completed: All tasks finished.');
});
