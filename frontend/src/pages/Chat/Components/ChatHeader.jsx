import React from "react";
import "../Styles/ChatHeader.css";

export default function ChatHeader({ selectedChat }) {
  return (
    <div className="chat-header">
      <h3>{selectedChat}</h3>
      <p>Online</p>
    </div>
  );
}