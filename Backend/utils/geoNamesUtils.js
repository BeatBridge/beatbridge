path = require('path');
require('dotenv').config({path:__dirname+'/./../.env'})
const fetch = require('node-fetch');

const USERNAME = process.env.GEONAMES_USERNAME;

async function fetchCoordinates(cityName) {
    let username = USERNAME
    const url = `http://api.geonames.org/searchJSON?q=${cityName}&maxRows=1&username=${username}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.geonames && data.geonames.length > 0) {
            const { lat, lng } = data.geonames[0];
            return { latitude: parseFloat(lat), longitude: parseFloat(lng) };
        } else {
            throw new Error(`No coordinates found for city: ${cityName}`);
        }
    } catch (error) {
        console.error(`Error fetching coordinates for city ${cityName}:`, error);
        return { latitude: 0, longitude: 0 }; // Default fallback
    }
}

module.exports = { fetchCoordinates };
