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
    updateUserProfile: async (jwt, profileData) => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`
                },
                body: JSON.stringify(profileData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response from server:', errorData);
                throw new Error('Failed to update profile');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating profile:', error);
            return { error: 'Failed to update profile' };
        }
    },
    updatePassword: async (jwt, passwordData) => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/update-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`
                },
                body: JSON.stringify(passwordData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response from server:', errorData); // Log error response from server
                throw new Error('Failed to update password');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating password:', error);
            return { error: 'Failed to update password' };
        }
    },
    uploadProfilePicture: async (formData) => {
        const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
        const response = await fetch(`${backendUrlAccess}/user/upload-profile-picture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
            },
            body: formData,
        });
        if (!response.ok) {
            throw new Error('Failed to upload profile picture');
        }
        return response.json();
    },
    fetchProfilePicture: async (userId) => {
        const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
        const response = await fetch(`${backendUrlAccess}/user/profile-picture/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
            },
        });
        if (!response.ok) {
            if (response.status === 404) {
                // Fallback to default profile picture
                return fetch('/src/assets/upsidedownpfp.jpg');
            }
            throw new Error('Failed to fetch profile picture');
        }
        return response.blob();
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
            const response = await fetch(`${backendUrlAccess}/user/songs`, {
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
    getFeaturedPlaylists: async () => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/spotify/featured-playlists`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch featured playlists');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching featured playlists:', error);
            return { error: 'Failed to fetch featured playlists' };
        }
    },
    getPlaylistTracks: async (playlistId) => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/spotify/playlists/${playlistId}/tracks`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch playlist tracks');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching playlist tracks:', error);
            return { error: 'Failed to fetch playlist tracks' };
        }
    },
    getTrackDetails: async (trackIds) => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/spotify/tracks?trackIds=${trackIds.join(',')}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch track details');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching track details:', error);
            return { error: 'Failed to fetch track details' };
        }
    },
    getArtistDetails: async (artistIds) => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/spotify/artists?artistIds=${artistIds.join(',')}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch artist details');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching artist details:', error);
            return { error: 'Failed to fetch artist details' };
        }
    },
    getStoredPlaylists: async () => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/playlists`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch playlists');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching playlists:', error);
            return { error: 'Failed to fetch playlists' };
        }
    },
    getStoredPlaylistTracks: async (playlistId) => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/playlists/${playlistId}/tracks`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch tracks');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching tracks:', error);
            return { error: 'Failed to fetch tracks' };
        }
    },
    getGenresByLocation: async () => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/genres-by-location`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch genres by location');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching genres by location:', error);
            return { error: 'Failed to fetch genres by location' };
        }
    },
    getTrendingArtists: async (jwt) => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/trending-artists`, {
                headers: {
                    'Authorization': `Bearer ${jwt}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch trending artists');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching trending artists:', error);
            return { error: 'Failed to fetch trending artists' };
        }
    },
    getTrendingArtistsMomentum: async (jwt) => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/trending-artists-momentum`, {
                headers: {
                    'Authorization': `Bearer ${jwt}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch trending artists momentum');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching trending artists momentum:', error);
            return { error: 'Failed to fetch trending artists momentum' };
        }
    },
    trackArtistSearch: async (artistSpotifyId) => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/track-artist-search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwt')}`
                },
                body: JSON.stringify({ artistSpotifyId }),
            });
            if (!response.ok) throw new Error('Failed to track artist search');
            return await response.json();
        } catch (error) {
            console.error('Error tracking artist search:', error);
            return { error: 'Failed to track artist search' };
        }
    },
    getLatestRecommendation: async (jwt) => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/latest-recommendation`, {
                headers: {
                    'Authorization': `Bearer ${jwt}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch latest recommendation');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching latest recommendation:', error);
            return { error: 'Failed to fetch latest recommendation' };
        }
    },
    fetchChatHistory: async () => {
        const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
        const response = await fetch(`${backendUrlAccess}/user/chat-messages`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error fetching chat history:', errorText);
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        // Map the response to include both user and AI messages
        const formattedData = data.flatMap(msg => [
            { text: `${msg.user ? msg.user.username : 'Unknown User'}: ${msg.text}`, user: 'You', createdAt: msg.createdAt },
            { text: `Beat Bot: ${msg.response}`, user: 'AI', createdAt: msg.createdAt }
        ]);

        return formattedData;
    },
    chatWithAI: async (prompt) => {
        const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
        const response = await fetch(`${backendUrlAccess}/user/chat-with-ai`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data;
    },
    fetchTaggedSongs: async () => {
        const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
        const response = await fetch(`${backendUrlAccess}/user/songs`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error fetching tagged songs:', errorText);
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data;
    },
    fetchArtistImages: async (artistIds) => {
        const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;

        try {
          const response = await fetch(`${backendUrlAccess}/user/spotify/artists?artistIds=${artistIds}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
            },
          });

          if (response.status === 429) {
            console.warn('Frontend: Rate limited by Spotify API');
            return { error: 'Frontend: Rate limited by Spotify API' };
          }

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Error fetching artist images:', errorText);
            throw new Error('Failed to fetch artist images');
          }

          return await response.json();
        } catch (error) {
          console.error('Error fetching artist images:', error);
          throw error;
        }
    },
    fetchPlaylists: async () => {
        const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
        const response = await fetch(`${backendUrlAccess}/user/playlists`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch playlists');
        }

        const data = await response.json();
        return data;
    },
    fetchPlaylistFollowers: async (playlistId) => {
        const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
        const response = await fetch(`${backendUrlAccess}/user/playlist-followers/${playlistId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch playlist followers');
        }

        const data = await response.json();
        return data;
    },
    fetchUsers: async (userId) => {
        if (!userId) {
            console.error('userId is required to fetch users.');
            return;
        }
        const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
        const response = await fetch(`${backendUrlAccess}/user/users?userId=${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        return await response.json();
    },
    fetchDirectMessageHistory: async (userId, otherUserId) => {
        const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
        const response = await fetch(`${backendUrlAccess}/user/messages/${userId}/${otherUserId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch direct message history');
        }
        return await response.json();
    },
    sendDirectMessage: async (message) => {
        const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
        const response = await fetch(`${backendUrlAccess}/user/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          },
          body: JSON.stringify(message),
        });
        if (!response.ok) {
          throw new Error('Failed to send direct message');
        }
        return await response.json();
    },
    forgotPassword: async (data) => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            return response.json();
        } catch (error) {
            console.error('Error during forgot password request:', error);
            throw error;
        }
    },
    resetPassword: async (data) => {
        try {
            const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
            const response = await fetch(`${backendUrlAccess}/user/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            return response.json();
        } catch (error) {
            console.error('Error during reset password request:', error);
            throw error;
        }
    }
};

export default API;
