import React from "react";
import "../Styles/MessageList.css";

const chatMessages = {
  Alice: [
    { from: "me", text: "Hi Alice!" },
    { from: "Alice", text: "Hey! How's it going?" }
  ],
  Bob: [
    { from: "me", text: "Hi Bob!" },
    { from: "Bob", text: "Yo! What's up?" }
  ],
  Charlie: [
    { from: "me", text: "Hey Charlie!" },
    { from: "Charlie", text: "Hi!" }
  ],
  Dana: [
    { from: "me", text: "Hello Dana!" },
    { from: "Dana", text: "Hey there!" }
  ]
};

export default function MessageList({ selectedChat }) {
  const messages = chatMessages[selectedChat] || [];

  return (
    <div className="message-list">
      {messages.map((msg, index) => (
        <div key={index} className={`message ${msg.from === "me" ? "sent" : "received"}`}>
          {msg.text}
        </div>
      ))}
    </div>
  );
}
