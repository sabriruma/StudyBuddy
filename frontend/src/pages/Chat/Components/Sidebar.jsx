import React from "react";
import "../Styles/Sidebar.css";

export default function Sidebar({
  confirmedUsers = [],
  selectedChat,
  onSelectChat,
  groups = [],
  selectedGroupId,
  onSelectGroup,
  onCreateGroup
}) {
  return (
    <div className="sidebar">
      <h2>Chats</h2>
      <ul className="chat-list">
        {confirmedUsers.map((user) => (
          <li
            key={user.id}
            className={selectedChat === user.id ? "active" : ""}
            onClick={() => onSelectChat(user.id)}
          >
            {user.userName || "Student"}
          </li>
        ))}
      </ul>

      <h2>Group Chats</h2>
      <div className="group-header">
        <button onClick={onCreateGroup}>+ Create Group</button>
      </div>
      <ul className="chat-list">
        {groups.map((group) => (
          <li
            key={group.id}
            className={selectedGroupId === group.id ? "active" : ""}
            onClick={() => onSelectGroup(group.id)}
          >
            {group.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
