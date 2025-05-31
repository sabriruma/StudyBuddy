import React from "react";
import "../Styles/MessageList.css";

export default function MessageList({ messages }) {
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