const fetch = require('node-fetch');
const { fetchCoordinates } = require('./geoNamesUtils');

async function fetchLocationFromMusicBrainz(artistName) {
    const encodedArtistName = encodeURIComponent(artistName);
    const url = `https://musicbrainz.org/ws/2/artist/?query=artist:${encodedArtistName}&fmt=json`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch location from MusicBrainz for artist ${artistName}`);
    }

    const data = await response.json();
    if (data.artists.length === 0) {
        throw new Error(`No artist found with name ${artistName} on MusicBrainz`);
    }

    const artist = data.artists[0];
    const location = artist["begin-area"] || artist.area || { name: 'Unknown', latitude: null, longitude: null };
    const countryCode = artist.country || 'Unknown';

    let coordinates = { latitude: 0, longitude: 0, countryCode: 'Unknown' };

    if (location.name && location.name !== 'Unknown') {
        coordinates = await fetchCoordinates(location.name);
    }

    return {
        name: location.name,
        countryCode: coordinates.countryCode !== 'Unknown' ? coordinates.countryCode : countryCode,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
    };
}

module.exports = { fetchLocationFromMusicBrainz };
