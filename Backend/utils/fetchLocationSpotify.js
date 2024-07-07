const fetch = require('node-fetch');

async function fetchLocationFromSpotify(spotifyId) {
    const accessToken = await getSystemUserToken();

    const response = await fetchWithRetry(
        `https://api.spotify.com/v1/artists/${spotifyId}`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch location from Spotify for artist with ID ${spotifyId}`);
    }

    const data = await response.json();
    // Here you need to extract location information from the Spotify response
    // Spotify API might not provide direct location data, you might need to modify this part
    // based on the available data. For now, we'll use a placeholder.

    return {
        name: data.name,
        latitude: 0, // Placeholder, replace with actual latitude if available
        longitude: 0 // Placeholder, replace with actual longitude if available
    };
}

module.exports = { fetchLocationFromSpotify };
