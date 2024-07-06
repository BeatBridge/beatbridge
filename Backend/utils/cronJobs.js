const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fetch = require('node-fetch');
const { refreshSpotifyToken } = require('./spotifyUtils');

async function fetchAndStoreFeaturedPlaylists() {
    console.log('Fetching and storing featured playlists...');
    const users = await prisma.user.findMany({
        where: { spotifyAccessToken: { not: null } },
    });

    for (const user of users) {
        try {
            const response = await fetch(`https://api.spotify.com/v1/browse/featured-playlists`, {
                headers: {
                    'Authorization': `Bearer ${user.spotifyAccessToken}`
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
                console.log(`Featured playlists updated for user ${user.id}`);
            } else {
                console.error(`Failed to fetch featured playlists for user ${user.id}:`, data);
            }
        } catch (error) {
            console.error('Error fetching featured playlists:', error);
        }
    }
    console.log('Completed fetching and storing featured playlists.');
}

async function fetchAndStoreTracksAndArtists() {
    console.log('Fetching and storing tracks and artists...');
    const playlists = await prisma.playlist.findMany();

    for (const playlist of playlists) {
        try {
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist.spotifyId}/tracks`, {
                headers: {
                    'Authorization': `Bearer ${process.env.SPOTIFY_ACCESS_TOKEN}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                for (const item of data.items) {
                    const track = item.track;

                    await prisma.track.upsert({
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
                        await prisma.artist.upsert({
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

async function fetchAndStoreArtistGenres() {
    const artists = await prisma.artist.findMany({
        where: { genres: { equals: [] } }
    });

    const artistIds = artists.map(artist => artist.spotifyId).join(',');

    try {
        const response = await fetch(`https://api.spotify.com/v1/artists?ids=${artistIds}`, {
            headers: {
                'Authorization': `Bearer ${process.env.SPOTIFY_ACCESS_TOKEN}`
            }
        });
        const data = await response.json();

        if (response.ok) {
            for (const artist of data.artists) {
                await prisma.artist.update({
                    where: { spotifyId: artist.id },
                    data: { genres: artist.genres }
                });
            }
            console.log('Artist genres updated successfully.');
        } else {
            console.error('Failed to fetch artist genres:', data);
        }
    } catch (error) {
        console.error('Error fetching artist genres:', error);
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
