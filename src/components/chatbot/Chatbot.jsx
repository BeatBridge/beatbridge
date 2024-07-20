import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import './chatbot.css';
import API from '../../api';

function Chatbot({ userInfo }) {
    const { chatHistory } = useOutletContext();
    const [messages, setMessages] = useState(chatHistory);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingAiMessage, setPendingAiMessage] = useState(null);

    useEffect(() => {
        setMessages(chatHistory);
    }, [chatHistory]);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const fetchedMessages = await API.fetchChatHistory();
                setMessages(fetchedMessages);
            } catch (error) {
                console.error('Error fetching chat history:', error);
            }
        }, 5000); // Fetch new messages every 5 seconds

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, []);

    const handleSend = async () => {
        if (input.trim()) {
            const newMessage = { text: `${userInfo.username}: ${input}`, user: 'You' };
            setMessages([...messages, newMessage]);
            setInput('');
            setLoading(true);

            // Add a pending AI message placeholder
            const aiMessagePlaceholder = { text: 'Beat Bot: ...', user: 'AI' };
            setMessages([...messages, newMessage, aiMessagePlaceholder]);
            setPendingAiMessage(aiMessagePlaceholder);

            try {
                console.log('Calling AI API...');
                const response = await API.chatWithAI(input);
                const aiMessage = { text: `Beat Bot: ${response}`, user: 'AI' };

                // Update the AI message placeholder with the actual response
                setMessages((prevMessages) => prevMessages.map((msg) => (msg === pendingAiMessage ? aiMessage : msg)));
                setPendingAiMessage(null);

                // Save user and AI messages to the database
                await API.saveChatMessage(input);
                await API.saveChatMessage(response);
            } catch (error) {
                const errorMessage = { text: 'Beat Bot: Error: Unable to get response.', user: 'AI' };
                setMessages((prevMessages) => prevMessages.map((msg) => (msg === pendingAiMessage ? errorMessage : msg)));
                setPendingAiMessage(null);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h1>Hi, {userInfo.username}, Ask anything to BeatBridge's AI chatbot built with Llama.</h1>
            </div>
            <div className="chat-window">
                {messages.length > 0 ? (
                    messages.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.user}`}>
                            <span className={`chat-message-user ${msg.user === 'AI' ? 'ai' : 'user'}`}>
                                {msg.text.split(':')[0]}
                            </span>: {msg.text.split(': ').slice(1).join(': ')}
                            {msg.user === 'AI' && <hr className="chat-divider" />}
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
