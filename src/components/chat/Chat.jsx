import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

const backendUrlAccess = import.meta.env.VITE_BACKEND_ADDRESS;
const socket = io(backendUrlAccess);

function Chat() {
    const { userId } = useParams();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        socket.emit('join', userId);

        socket.on('private_message', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        return () => {
            socket.off('private_message');
        };
    }, [userId]);

    const sendMessage = () => {
        socket.emit('private_message', { to: userId, message });
        setMessages((prevMessages) => [...prevMessages, { message, from: 'me' }]);
        setMessage('');
    };

    return (
        <div className="chat-container">
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.from === 'me' ? 'sent' : 'received'}`}>
                        {msg.message}
                    </div>
                ))}
            </div>
            <div className="message-input">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}

export default Chat;
