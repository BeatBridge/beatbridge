import React, { useState, useEffect } from 'react';
import API from '../../api.js';
import './taggingscreen.css'

const TaggingScreen = () => {
  const [taggedSongs, setTaggedSongs] = useState([]);

  useEffect(() => {
    const fetchTaggedSongs = async () => {
      try {
        const songs = await API.getTaggedSongs();
        setTaggedSongs(songs);
      } catch (error) {
        console.error('Error fecthing tagged songs:', error);
      }
    }

    fetchTaggedSongs();
  }, []);

  return (
      <div className="tagging-screen">
          <h2>Tagged Songs</h2>
          {taggedSongs.length > 0 ? (
              <ul>
                  {taggedSongs.map((song, index) => (
                      <li key={index}>
                          <h3>{song.title}</h3>
                          <p>{song.artist} - {song.album}</p>
                          <p>Genre: {song.genre}</p>
                          <p>Mood: {song.mood}</p>
                          <p>Tempo: {song.tempo}</p>
                          <p>Custom Tags: {song.customTags.join(', ')}</p>
                      </li>
                  ))}
              </ul>
          ) : (
              <p>No tagged songs available.</p>
          )}
      </div>
  );
}

export default TaggingScreen;
