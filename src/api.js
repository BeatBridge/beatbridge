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
            if (!response.ok) throw new Error('Failed to fetch user info');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching user info:', error);
            return { error: 'Failed to fetch user info' };
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
    getTopArtists: async (token) => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/spotify/top-artists`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch top artists');
            return await response.json();
        } catch (error) {
            console.error('Error fetching top artists:', error);
            return { error: 'Failed to fetch top artists' };
        }
    },
    getTopTracks: async (token) => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/spotify/top-tracks`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch top tracks');
            return await response.json();
        } catch (error) {
            console.error('Error fetching top tracks:', error);
            return { error: 'Failed to fetch top tracks' };
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
    getGlobalTop50: async (token) => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/spotify/global-top-50`, {
                headers: {
                    'Authorization': `Bearer ${token}`
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
    getViral50Global: async (token) => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/spotify/viral-50-global`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch viral 50 global');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching viral 50 global:', error);
            return { error: 'Failed to fetch viral 50 global' };
        }
    }
};

export default API;
