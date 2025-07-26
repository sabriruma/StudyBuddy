import React from "react";
import "../Styles/Sidebar.css";

export default function Sidebar({
  confirmedUsers = [],
  enhancedUsers = [],
  selectedChat,
  onSelectChat,
  groups = [],
  selectedGroupId,
  onSelectGroup,
  onCreateGroup
}) {
  console.log("confirmedUsers:", confirmedUsers);
console.log("enhancedUsers:", enhancedUsers);
  return (
    <div className="sidebar">
      <h2>Chats</h2>
      <ul className="chat-list">
      {confirmedUsers.map((user) => {
  const fullUser = enhancedUsers.find(u => u.id === user.id);
  return (
    <li
      key={user.id}
      className={selectedChat === user.id ? "active" : ""}
      onClick={() => onSelectChat(user.id)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <img
          src={fullUser?.avatar || ""}
          alt="avatar"
          style={{ width: 30, height: 30, borderRadius: "50%" }}
        />
        {fullUser?.userName || "Student"}
      </div>
    </li>
  );
})}
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
