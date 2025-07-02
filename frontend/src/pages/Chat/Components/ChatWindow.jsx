import React, { useState } from "react";
import "../Styles/ChatWindow.css";

export default function ChatWindow({ selectedChat, chatDisplayName, messages, onSendMessage }) {
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(selectedChat, newMessage);
    setNewMessage("");
  };

  //test
  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>Chat with {chatDisplayName}</h3>
      </div>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-bubble ${msg.from === selectedChat ? "incoming" : "outgoing"}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          placeholder="Type a message..."
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
