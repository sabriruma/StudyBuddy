import React, { useState } from 'react';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() === '') return;
    setMessages([...messages, { text: input, sender: 'You' }]);
    setInput('');
  };

  return (
    <div className="chat-container">
      <h1 className="chat-header">Chat Room</h1>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className="chat-message">
            <span className="chat-sender">{msg.sender}:</span>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="chat-send-button" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
