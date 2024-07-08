const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { fetchLocationFromMusicBrainz } = require('./musicBrainzUtils');
const { refreshSpotifyToken } = require('./spotifyUtils');
const { fetchLocationFromSpotify } = require('./fetchLocationSpotify')
const { emitUpdate } = require('../socket');
require('./createSystemUser.js');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options, retries = 3, delayMs = 1000) {
    try {
        const response = await fetch(url, options);
        if (response.status === 429) { // Too Many Requests
            if (retries > 0) {
                console.warn(`Rate limited. Retrying in ${delayMs} ms...`);
                await delay(delayMs);
                return fetchWithRetry(url, options, retries - 1, delayMs * 2);
            } else {
                throw new Error('Too many requests, retry limit reached');
            }
        }
        return response;
    } catch (error) {
        if (retries > 0) {
            console.warn(`Fetch error. Retrying in ${delayMs} ms...`);
            await delay(delayMs);
            return fetchWithRetry(url, options, retries - 1, delayMs * 2);
        } else {
            throw error;
        }
    }
}

async function getLocationForArtist(artist) {
    try {
        const artistWithLocation = await prisma.artist.findUnique({
            where: { id: artist.id },
            include: { locations: true }
        });

        let location;
        if (artistWithLocation && artistWithLocation.locations.length > 0) {
            location = artistWithLocation.locations[0];
            console.log(`Location found in database for artist ${artist.name}: ${location.name}, Country Code: ${location.countryCode}`);

            if (!location.countryCode || location.countryCode === 'Unknown') {
                console.warn(`Country code missing or invalid for artist ${artist.name}. Updating country code.`);
                let fetchedLocation;
                try {
                    fetchedLocation = await fetchLocationFromMusicBrainz(artist.name);
                    console.log(`Location fetched from MusicBrainz for artist ${artist.name}: ${fetchedLocation.name}, Country Code: ${fetchedLocation.countryCode}`);
                } catch (error) {
                    if (error.message.includes('No artist found with name')) {
                        console.warn(`Artist ${artist.name} not found on MusicBrainz. Falling back to Spotify.`);
                    } else {
                        console.error(`Failed to fetch location from MusicBrainz for artist ${artist.name}:`, error);
                    }
                    console.warn(`Falling back to fetching location from Spotify for artist ${artist.name}.`);
                    fetchedLocation = await fetchLocationFromSpotify(artist.spotifyId);
                    console.log(`Location fetched from Spotify for artist ${artist.name}: ${fetchedLocation.name}, Country Code: ${fetchedLocation.countryCode}`);
                }

                location = await prisma.location.update({
                    where: { id: location.id },
                    data: {
                        countryCode: fetchedLocation.countryCode
                    }
                });

                console.log(`Updated country code for location of artist ${artist.name}: ${location.countryCode}`);
            }

            return {
                name: location.name,
                latitude: location.latitude,
                longitude: location.longitude,
                countryCode: location.countryCode
            };
        }

        console.warn(`No location mapping found for artist ${artist.name}. Fetching from MusicBrainz.`);
        let fetchedLocation;
        try {
            fetchedLocation = await fetchLocationFromMusicBrainz(artist.name);
            console.log(`Location fetched from MusicBrainz for artist ${artist.name}: ${fetchedLocation.name}, Country Code: ${fetchedLocation.countryCode}`);
        } catch(error) {
            console.error(`Failed to fetch location from MusicBrainz for artist ${artist.name}:`, error);
            console.warn(`Falling back to fetching location from Spotify for artist ${artist.name}.`);
            fetchedLocation = await fetchLocationFromSpotify(artist.spotifyId);
            console.log(`Location fetched from Spotify for artist ${artist.name}: ${fetchedLocation.name}, Country Code: ${fetchedLocation.countryCode}`);
        }

        const newLocation = await prisma.location.create({
            data: {
                name: fetchedLocation.name,
                latitude: fetchedLocation.latitude,
                longitude: fetchedLocation.longitude,
                countryCode: fetchedLocation.countryCode,
                artists: {
                    connect: { id: artist.id }
                }
            }
        });

        console.log(`New location stored in database for artist ${artist.name}: ${newLocation.name}, Country Code: ${newLocation.countryCode}`);
        return {
            name: newLocation.name,
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
            countryCode: newLocation.countryCode
        };
    } catch (error) {
        console.error(`Error fetching location for artist ${artist.name}:`, error);
        return {
            name: 'Unknown',
            latitude: 0,
            longitude: 0,
            countryCode: 'Unknown'
        };
    }
}

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
        const response = await fetchWithRetry(
            `https://api.spotify.com/v1/browse/featured-playlists`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
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
            const response = await fetchWithRetry(
                `https://api.spotify.com/v1/playlists/${playlist.spotifyId}/tracks`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );
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

        await delay(1000); // Add a delay between playlist fetches to reduce rate limiting
    }
    console.log('Completed fetching and storing tracks and artists.');
}

async function fetchAndStoreArtistGenres() {
    console.log('Fetching and storing artists genres...');
    const artists = await prisma.artist.findMany({
        where: { genres: { equals: [] } }
    });

    const accessToken = await getSystemUserToken();

    for (const artist of artists) {
        try {
            console.log(`Fetching genres for artist: ${artist.name} (Spotify ID: ${artist.spotifyId})`);

            const response = await fetchWithRetry(
                `https://api.spotify.com/v1/artists/${artist.spotifyId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to fetch genres for artist ${artist.spotifyId}:`, errorText);
                await delay(1000); // Delay for 1 second before the next request
                continue; // Skip this artist and continue with the next
            }

            const data = await response.json();
            console.log(`Genres fetched for artist ${artist.name}: ${data.genres.join(', ')}`);

            await prisma.artist.update({
                where: { spotifyId: artist.spotifyId },
                data: { genres: data.genres }
            });
            console.log(`Genres updated for artist ${artist.name} in database.`);

            // Ensure getLocationForArtist is called
            const location = await getLocationForArtist(artist);
            console.log(`Location fetched for artist ${artist.name}: ${location.name}, ${location.latitude}, ${location.longitude}`);

            if (location && location.name) { // Check if location is valid
                await prisma.location.upsert({
                    where: { name: location.name },
                    update: {
                        genres: {
                            set: data.genres // Assuming genres is a list of strings
                        },
                        artists: {
                            connect: { id: artist.id }
                        }
                    },
                    create: {
                        name: location.name,
                        latitude: location.latitude,
                        longitude: location.longitude,
                        genres: data.genres,
                        artists: {
                            connect: { id: artist.id }
                        }
                    }
                });
                console.log(`Location and genres updated for ${location.name} in database.`);
            } else {
                console.warn(`No valid location found for artist ${artist.name}. Skipping location update.`);
            }
        } catch (error) {
            console.error(`Error fetching genres for artist ${artist.name}:`, error);
        }

        await delay(1000); // Delay for 1 second before the next request
    }

    console.log('Completed fetching and storing artist genres.');
}

cron.schedule('*/10 * * * *', async () => {
    console.log('Cron job started: Running cron job to fetch Spotify data...');
    await fetchAndStoreFeaturedPlaylists();
    await fetchAndStoreTracksAndArtists();
    await fetchAndStoreArtistGenres();
    console.log('Cron job completed: All tasks finished.');
});
