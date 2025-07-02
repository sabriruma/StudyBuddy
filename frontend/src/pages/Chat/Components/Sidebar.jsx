import React from "react";
import "../Styles/Sidebar.css";

//test
export default function Sidebar({ confirmedUsers, selectedChat, onSelectChat }) {
  return (
    <div className="sidebar">
      <h2>Chats</h2>
      <ul className="chat-list">
        {confirmedUsers.map(user => (
          <li
            key={user.id}
            className={selectedChat === user.id ? "active" : ""}
            onClick={() => onSelectChat(user.id)}
          >
            {user.userName || "Student"}
          </li>
        ))}
      </ul>
    </div>
  );
}
