const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { fetchLocationFromMusicBrainz } = require('./musicBrainzUtils');
const { refreshSpotifyToken } = require('./spotifyUtils');
const { fetchLocationFromSpotify } = require('./fetchLocationSpotify');
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
            if (!location.countryCode || location.countryCode === 'Unknown') {
                console.warn(`Country code missing or invalid for artist ${artist.name}. Updating country code.`);
                let fetchedLocation;
                try {
                    fetchedLocation = await fetchLocationFromMusicBrainz(artist.name);
                } catch (error) {
                    if (error.message.includes('No artist found with name')) {
                        console.warn(`Artist ${artist.name} not found on MusicBrainz. Falling back to Spotify.`);
                    } else {
                        console.error(`Failed to fetch location from MusicBrainz for artist ${artist.name}:`, error);
                    }
                    console.warn(`Falling back to fetching location from Spotify for artist ${artist.name}.`);
                    fetchedLocation = await fetchLocationFromSpotify(artist.spotifyId);
                }

                location = await prisma.location.update({
                    where: { id: location.id },
                    data: {
                        countryCode: fetchedLocation.countryCode
                    }
                });
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
        } catch (error) {
            console.error(`Failed to fetch location from MusicBrainz for artist ${artist.name}:`, error);
            console.warn(`Falling back to fetching location from Spotify for artist ${artist.name}.`);
            fetchedLocation = await fetchLocationFromSpotify(artist.spotifyId);
        }

        const newLocation = await prisma.location.upsert({
            where: { name: fetchedLocation.name },
            update: {
                latitude: fetchedLocation.latitude,
                longitude: fetchedLocation.longitude,
                countryCode: fetchedLocation.countryCode,
                artists: {
                    connect: { id: artist.id }
                }
            },
            create: {
                name: fetchedLocation.name,
                latitude: fetchedLocation.latitude,
                longitude: fetchedLocation.longitude,
                countryCode: fetchedLocation.countryCode,
                artists: {
                    connect: { id: artist.id }
                }
            }
        });
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
        } else {
            console.error(`Failed to fetch featured playlists:`, data);
        }
    } catch (error) {
        console.error('Error fetching featured playlists:', error);
    }
}

async function fetchAndStoreTracksAndArtists() {
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
                        const existingArtist = await prisma.artist.findUnique({
                            where: { spotifyId: artist.id },
                            include: { locations: true }
                        });

                        const artistDetails = await fetchWithRetry(
                            `https://api.spotify.com/v1/artists/${artist.id}`,
                            {
                                headers: {
                                    'Authorization': `Bearer ${accessToken}`
                                }
                            }
                        );

                        if (artistDetails.ok) {
                            const artistData = await artistDetails.json();
                            const updateData = {
                                name: artist.name,
                                popularity: artistData.popularity
                            };

                            if (!existingArtist || existingArtist.genres.length === 0) {
                                updateData.genres = artistData.genres;
                            }

                            const updatedArtist = await prisma.artist.upsert({
                                where: { spotifyId: artist.id },
                                update: updateData,
                                create: {
                                    spotifyId: artist.id,
                                    name: artist.name,
                                    genres: artistData.genres || [],
                                    popularity: artistData.popularity,
                                }
                            });

                            if (!existingArtist || existingArtist.locations.length === 0) {
                                // Fetch location only if it does not exist
                                // await getLocationForArtist({ id: updatedArtist.id });
                                await getLocationForArtist(updatedArtist);
                            }
                        } else {
                            console.error(`Failed to fetch details for artist ${artist.id}`);
                        }
                    }
                }
            } else {
                console.error(`Failed to fetch tracks for playlist ${playlist.id}:`, data);
            }
        } catch (error) {
            console.error('Error fetching tracks:', error);
        }

        await delay(1000); // Add a delay between playlist fetches to reduce rate limiting
    }
}

async function fetchAndStoreArtistGenres() {
    const artists = await prisma.artist.findMany(); // Fetch all artists, not just those with empty genres

    const accessToken = await getSystemUserToken();

    for (const artist of artists) {
        try {
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

            await prisma.artist.update({
                where: { spotifyId: artist.spotifyId },
                data: { genres: data.genres }
            });

            // Ensure getLocationForArtist is called
            const location = await getLocationForArtist(artist);

            if (location && location.name) { // Check if location is valid
                await prisma.location.upsert({
                    where: { name: location.name },
                    update: {
                        artists: {
                            connect: { id: artist.id }
                        }
                    },
                    create: {
                        name: location.name,
                        latitude: location.latitude,
                        longitude: location.longitude,
                        countryCode: location.countryCode,
                        artists: {
                            connect: { id: artist.id }
                        }
                    }
                });
            } else {
                console.warn(`No valid location found for artist ${artist.name}. Skipping location update.`);
            }
        } catch (error) {
            console.error(`Error fetching genres for artist ${artist.name}:`, error);
        }

        await delay(1000); // Delay for 1 second before the next request
    }
}

// Schedule a cron job to that runs every day at 10am
cron.schedule('0 10 * * *', async () => {
    await fetchAndStoreFeaturedPlaylists();
    await fetchAndStoreTracksAndArtists();
    await fetchAndStoreArtistGenres();
});
