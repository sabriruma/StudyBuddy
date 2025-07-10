import React, { useState } from "react";
import "../Styles/ChatWindow.css";
import ChatHeader from "./ChatHeader";
import { useEffect, useRef } from "react";

export default function ChatWindow({ selectedChat, chatDisplayName, messages, onSendMessage }) {
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(selectedChat, newMessage);
    setNewMessage("");
  };

  const messagesEndRef = useRef(null);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);

  //test
  return (
    <div className="chat-window">
  <div className="chat-window-inner">
    <ChatHeader selectedChat={`${chatDisplayName}`} />

    <div className="chat-messages">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`chat-bubble ${msg.from === selectedChat ? "incoming" : "outgoing"}`}
        >
          {msg.text}
        </div>
      ))}
      <div ref={messagesEndRef} />
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
</div>

  );
}
