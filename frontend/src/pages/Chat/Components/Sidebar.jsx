import React from "react";
import "../Styles/Sidebar.css";

const chats = ["Alice", "Bob", "Charlie", "Dana"];

export default function Sidebar({ selectedChat, onSelectChat }) {
  return (
    <div className="sidebar">
      <h2>Chats</h2>
      <ul className="chat-list">
        {chats.map((chat, index) => (
          <li
            key={index}
            className={
              chat === selectedChat ? "active" : ""
            }
            onClick={() => onSelectChat(chat)}
          >
            {chat}
          </li>
        ))}
      </ul>
    </div>
  );
}