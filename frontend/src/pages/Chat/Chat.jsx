import React, { useState } from 'react';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversations] = useState(['Alice', 'Bob', 'Charlie']);
  const [currentChat, setCurrentChat] = useState('Alice');

  const handleSend = () => {
    if (input.trim() === '') return;
    setMessages([...messages, { text: input, sender: 'You' }]);
    setInput('');
  };

  return (
    <div className="chat-page">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <h2 className="sidebar-header">Chats</h2>
        {conversations.map((name, index) => (
          <div
            key={index}
            className={`chat-list-item ${name === currentChat ? 'active' : ''}`}
            onClick={() => {
              setCurrentChat(name);
              setMessages([]); // Reset messages for each chat for now
            }}
          >
            {name}
          </div>
        ))}
      </div>

  {/* Chat Room */}
  <div className="chat-container">
  <div className="chat-header">Chat with {currentChat}</div>
  <div className="chat-messages">
    {messages.map((msg, index) => (
      <div
        key={index}
        className={`chat-bubble ${msg.sender === 'You' ? 'you' : 'other'}`}
      >
        <div className="chat-bubble-text">
          <span className="chat-sender">{msg.sender}</span>
          <span>{msg.text}</span>
        </div>
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
    </div>
  );
};

export default Chat;
