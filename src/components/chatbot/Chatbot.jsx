// src/components/chatbot/Chatbot.jsx
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import './chatbot.css';
import API from '../../api';

function Chatbot({ userInfo }) {
    const { chatHistory } = useOutletContext();
    const [messages, setMessages] = useState(chatHistory);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMessages(chatHistory);
    }, [chatHistory]);

    const handleSend = async () => {
        if (input.trim()) {
            const newMessage = { text: input, user: 'You' };
            setMessages([...messages, newMessage]);
            setInput('');
            setLoading(true);

            try {
                const response = await API.chatWithAI(input);
                const aiMessage = { text: response, user: 'AI' };
                setMessages([...messages, newMessage, aiMessage]);

                // Save user and AI messages to the database
                await API.saveChatMessage(input);
                await API.saveChatMessage(response);
            } catch (error) {
                setMessages([...messages, newMessage, { text: 'Error: Unable to get response.', user: 'AI' }]);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h1>Ask anything to BeatBridge's AI chatbot built with Llama.</h1>
                <h3>Hi, {userInfo.username}!</h3>
            </div>
            <div className="chat-window">
                {messages.length > 0 ? (
                    messages.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.user}`}>
                            <span>{msg.user}: </span>{msg.text}
                        </div>
                    ))
                ) : (
                    <p>No chat history available.</p>
                )}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' ? handleSend() : null}
                    disabled={loading}
                    placeholder="Type your message..."
                />
                <button onClick={handleSend} disabled={loading}>
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </div>
        </div>
    );
}

export default Chatbot;
