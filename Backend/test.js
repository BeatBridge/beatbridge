const fetch = require('node-fetch');
async function fetchLocationFromMusicBrainz(artistName) {
    const encodedArtistName = encodeURIComponent(artistName);
    const url = `https://musicbrainz.org/ws/2/artist/?query=artist:${encodedArtistName}&fmt=json`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch location from MusicBrainz for artist ${artistName}`);
        }
        const data = await response.json();

        for (let i = 0; i < data.artists.length; i++) {
            console.log(data.artists[i].country);
        }
    } catch (error) {
        console.error(error);
    }
}

fetchLocationFromMusicBrainz("Burna Boy");
