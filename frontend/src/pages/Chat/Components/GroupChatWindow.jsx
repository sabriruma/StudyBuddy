import React, { useState } from "react";
import "../Styles/ChatWindow.css";
import EditGroupModal from "./EditGroupModal";

export default function GroupChatWindow({ group, messages, onSendMessage, currentUserId, confirmedUsers, onGroupUpdated }) {
  const [newMessage, setNewMessage] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(group.id, newMessage);
    setNewMessage("");
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src={group.avatar}
            alt="group avatar"
            style={{ width: 40, height: 40, borderRadius: "50%" }}
          />
          <h3>{group.name}</h3>
        </div>
        <button className="edit-group-btn" onClick={() => setShowEditModal(true)}>Edit Group</button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-bubble ${msg.from === currentUserId ? "outgoing" : "incoming"}`}
          >
            <strong>{msg.senderName}</strong>
            <p>{msg.text}</p>
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

      {showEditModal && (
        <EditGroupModal
          group={group}
          confirmedUsers={confirmedUsers}
          onClose={() => setShowEditModal(false)}
          onGroupUpdated={onGroupUpdated}
        />
      )}
    </div>
  );
}
