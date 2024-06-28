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
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching user info:', error);
            return { error: 'Failed to fetch user info' };
        }
    }
};

export default API;
