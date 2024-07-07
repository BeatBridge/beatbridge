const fetch = require('node-fetch');

async function fetchLocationFromMusicBrainz(artistName) {
    const response = await fetch(`https://musicbrainz.org/ws/2/artist/?query=artist:${encodeURIComponent(artistName)}&fmt=json`);
    if (!response.ok) {
        throw new Error(`Failed to fetch location for artist ${artistName}`);
    }
    const data = await response.json();
    if (data.artists.length > 0) {
        const artist = data.artists[0];
        return {
            name: artist.area?.name || 'Unknown',
            latitude: artist.area?.latitude || null,
            longitude: artist.area?.longitude || null,
        };
    } else {
        throw new Error(`No data found for artist ${artistName}`);
    }
}

module.exports = { fetchLocationFromMusicBrainz };
