import React, { useEffect, useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import './friends.css';
import defaultPfp from '/src/assets/default_pfp.jpg';
import API from '../../api.js';

function Friends() {
    const { selectedUser, closeChat, userInfo } = useOutletContext();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const ws = useRef(null); // Use useRef to persist WebSocket across renders

    useEffect(() => {
        if (!selectedUser) return;

        setLoading(true);
        const fetchMessages = async () => {
            try {
                const response = await API.fetchDirectMessageHistory(userInfo.id, selectedUser.id);
                setMessages(response);
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        if (ws.current) {
            ws.current.close(); // Close existing WebSocket connection if it exists
        }

        const webSocketUrlAccess = import.meta.env.VITE_WEB_SOCKET_ADDRESS;
        ws.current = new WebSocket(`${webSocketUrlAccess}`);

        ws.current.onopen = () => {

        };

        ws.current.onmessage = (event) => {
            try {
                const newMessage = JSON.parse(event.data);
                setMessages((prevMessages) => {
                    const isDuplicate = prevMessages.some(
                        (msg) => msg.id === newMessage.id
                    );
                    if (!isDuplicate) {
                        return [...prevMessages, newMessage];
                    }
                    return prevMessages;
                });
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        ws.current.onclose = () => {

        };

        return () => {
            if (ws.current) {
                ws.current.close(); // Clean up WebSocket connection on component unmount
            }
        };
    }, [selectedUser, userInfo.id]);

    const handleSendMessage = async () => {
        if (newMessage.trim() !== '') {
            const message = {
                senderId: userInfo.id,
                receiverId: selectedUser.id,
                content: newMessage,
                sender: { username: userInfo.username } // Include the sender's username
            };

            // Send message to WebSocket
            if (ws.current) {
                ws.current.send(JSON.stringify(message));
            }

            // Clear the input field
            setNewMessage('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

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
                        <h4>Direct Messages</h4>
                    )}
                </div>
                <div className="friends-chat-body">
                    {selectedUser ? (
                        loading ? (
                            <p>Loading...</p>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={index} className={`friends-chat-message ${msg.senderId === userInfo.id ? 'my-message' : 'their-message'}`}>
                                    <span className={`friends-chat-message-user ${msg.senderId === userInfo.id ? 'user' : 'ai'}`}>
                                        {msg.sender?.username || 'Unknown'}
                                    </span>: <span className="friends-chat-message-content">{msg.content}</span>
                                    {msg.senderId !== userInfo.id && <hr className="friends-chat-divider" />}
                                </div>
                            ))
                        )
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
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message"
                        />
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Friends;
