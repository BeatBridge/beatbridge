const API = {
    getUserInfo: async (jwt) => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/info`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${jwt}`
                }
            });
            if (response.status === 401) throw new Error('Unauthorized');
            if (!response.ok) throw new Error('Failed to fetch user info');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching user info:', error);
            return { error: error.message };
        }
    },
    signup: async (formData) => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error(response);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error signing up:', error);
            return { error: 'Failed to sign up' };
        }
    },
    login: async (credentials) => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials),
            });
            if (!response.ok) throw new Error('Failed to log in');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error logging in:', error);
            return { error: 'Failed to log in' };
        }
    },
    verifyEmail: async (token) => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token }),
            });
            if (!response.ok) throw new Error('Failed to verify email');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error verifying email:', error);
            return { error: 'Failed to verify email' };
        }
    },
    verifySpotify: async (token) => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/spotify/confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token }),
            });
            if (!response.ok) throw new Error('Failed to verify Spotify login');
            return await response.json();
        } catch (error) {
            console.error('Error verifying Spotify login:', error);
            return { error: 'Failed to verify Spotify login' };
        }
    },
    sendCode: async (code, jwt) => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/create-access-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`
                },
                body: JSON.stringify({ code }),
            });
            if (!response.ok) throw new Error('Failed to create spotify access token');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating access token:', error);
            return { error: 'Failed to create access token' };
        }
    },
    getGlobalTop50: async () => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/spotify/global-top-50`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch global top 50');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching global top 50:', error);
            return { error: 'Failed to fetch global top 50' };
        }
    },
    getViral50Global: async () => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/spotify/viral-50-global`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch viral 50 global');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching viral 50 global:', error);
            return { error: 'Failed to fetch viral 50 global' };
        }
    },
    searchSongs: async (query) => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/spotify/search?q=${query}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                }
            });
            if (!response.ok) throw new Error('Failed to search songs');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error searching songs:', error);
            return { error: 'Failed to search songs' };
        }
    },
    createSong: async (songData) => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch (`${backendUrlAccess}/user/songs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                },
                body: JSON.stringify(songData)
            });
            if (!response.ok) throw new Error('Failed to create song');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating song:', error);
            return { error: 'Failed to create song' };
        }
    },
    tagSong: async (songId, tags) => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/songs/${songId}/tags`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                },
                body: JSON.stringify(tags),
            });
            if (!response.ok) throw new Error('Failed to save tags');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error saving tags:', error);
            return { error: 'Failed to save tags'};
        }
    },
    getTaggedSongs: async () => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/songs`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch tagged songs');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching tagged songs:', error);
            return { error: 'Failed to fetch tagged songs' };
        }
    },
    getSongDetails: async (songId) => {
        const response = await fetch(`/api/song/${songId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('jwt')}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch song details.');
        }
        return response.json();
    },
    getLibrary: async () => {
        const response = await fetch('/api/library', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('jwt')}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch library.');
        }
        return response.json();
    },
};

export default API;