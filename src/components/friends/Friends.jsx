import React from 'react';
import { useOutletContext } from 'react-router-dom';
import './friends.css';
import defaultPfp from '/src/assets/default_pfp.jpg';

function Friends() {
  const { selectedUser, messages, newMessage, setNewMessage, sendMessage, closeChat } = useOutletContext();

  return (
    <div className="friends-container">
      <div className="friends-chat-window">
        <div className="friends-chat-header">
          {selectedUser ? (
            <>
              <img
                src={selectedUser.profilePicture || defaultPfp}
                alt="Profile"
                className="friends-chat-profile-picture"
              />
              <h4>{selectedUser.username}</h4>
              <button onClick={closeChat}>Close</button>
            </>
          ) : (
            <h4>Select a friend to start chatting.</h4>
          )}
        </div>
        <div className="friends-chat-body">
          {selectedUser ? (
            messages.map((msg, index) => (
              <div key={index} className={`friends-chat-message ${msg.sender === 'me' ? 'my-message' : 'their-message'}`}>
                {msg.text}
              </div>
            ))
          ) : (
            <p>Select a friend to start chatting.</p>
          )}
        </div>
        {selectedUser && (
          <div className="friends-chat-footer">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message"
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Friends;
