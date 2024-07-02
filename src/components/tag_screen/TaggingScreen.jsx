import React, { useState, useEffect } from 'react';
import API from '../../api';
import './tagging_screen.css'

const TaggingScreen = ({ songId, onBack, jwt }) => {
  const [songDetails, setSongDetails] = useState({});
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [tempo, setTempo] = useState('');
  const [customTags, setCustomTags] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSongDetails = async () => {
      try {
        const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
        const response = await fetch(`${backendUrlAccess}/api/songs/${songId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch song details');
        const data = await response.json();
        setSongDetails(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching song details:', error);
        setIsLoading(false);
      }
    };

    fetchSongDetails();
  }, [songId, jwt]);

  const handleSave = async () => {
    const tags = {
      genre,
      mood,
      tempo,
      customTags: customTags.split(',').map(tag => tag.trim()),
    };

    try {
      const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
      const response = await fetch(`${backendUrlAccess}/api/songs/${songId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify(tags),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      onBack(); // Navigate back to Song Details Screen
    } catch (error) {
      console.error('Error saving tags:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col">
          <h2>{songDetails.title}</h2>
          <p>{songDetails.artist} - {songDetails.album}</p>
        </div>
      </div>
      <form>
        <div className="mb-3">
          <label className="form-label">Genre</label>
          <select
            className="form-select"
            value={genre}
            onChange={e => setGenre(e.target.value)}
          >
            <option value="">Select Genre</option>
            <option value="Pop">Pop</option>
            <option value="Rock">Rock</option>
            <option value="Jazz">Jazz</option>
            {/* Add more genres as needed */}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Mood</label>
          <select
            className="form-select"
            value={mood}
            onChange={e => setMood(e.target.value)}
          >
            <option value="">Select Mood</option>
            <option value="Happy">Happy</option>
            <option value="Sad">Sad</option>
            <option value="Energetic">Energetic</option>
            {/* Add more moods as needed */}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Tempo</label>
          <select
            className="form-select"
            value={tempo}
            onChange={e => setTempo(e.target.value)}
          >
            <option value="">Select Tempo</option>
            <option value="Slow">Slow</option>
            <option value="Medium">Medium</option>
            <option value="Fast">Fast</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Custom Tags</label>
          <input
            type="text"
            className="form-control"
            value={customTags}
            onChange={e => setCustomTags(e.target.value)}
            placeholder="Enter custom tags separated by commas"
          />
        </div>
        <div className="d-flex justify-content-between">
          <button type="button" className="btn btn-primary" onClick={handleSave}>Save</button>
          <button type="button" className="btn btn-secondary" onClick={onBack}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="d-flex justify-content-center my-5">
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

export default TaggingScreen;
