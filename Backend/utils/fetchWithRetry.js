const fetch = require('node-fetch');

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
                return await fetchWithRetry(url, options, retries - 1, delayMs * 2);
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

module.exports = { delay, fetchWithRetry };
