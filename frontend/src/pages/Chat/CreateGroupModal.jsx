import React, { useState } from "react";
import { db, auth } from "../../firebase/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import "./CreateGroupModal.css";

const avatarOptions = [
  "/group1.png",
  "/group2.png",
  "/group3.png",
];

export default function CreateGroupModal({ confirmedUsers, onClose, onGroupCreated }) {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);

  const currentUserId = auth.currentUser?.uid;

  const toggleUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedUsers.length === 0) return;

    const groupRef = collection(db, "groups");

    const docRef = await addDoc(groupRef, {
      name: groupName,
      avatar: selectedAvatar,
      members: [...selectedUsers, currentUserId],
      createdBy: currentUserId,
      createdAt: serverTimestamp()
    });

    onGroupCreated(); // Refresh list
    onClose(); // Close modal
  };

  return (
    <div className="group-modal-overlay">
      <div className="group-modal">
        <h2>Create Group</h2>
        <input
          type="text"
          placeholder="Enter group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          maxLength={25}
        />

        <h4>Choose a group photo:</h4>
        <div className="avatar-options">
          {avatarOptions.map((avatar, idx) => (
            <img
              key={idx}
              src={avatar}
              alt={`Group avatar ${idx + 1}`}
              className={selectedAvatar === avatar ? "selected" : ""}
              onClick={() => setSelectedAvatar(avatar)}
              style={{
                width: "60px",
                height: "60px",
                objectFit: "cover",
                margin: "0 8px 10px 0",
                borderRadius: "50%",
                border: selectedAvatar === avatar ? "3px solid #0984e3" : "1px solid #ccc",
                cursor: "pointer"
              }}
            />
          ))}
        </div>

        <h4>Add users to group:</h4>
        <ul className="user-list">
          {confirmedUsers.map(user => (
            <li key={user.id}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => toggleUser(user.id)}
                />
                {user.userName}
              </label>
            </li>
          ))}
        </ul>

        <div className="modal-actions">
          <button onClick={handleCreateGroup}>Create Group</button>
          <button onClick={onClose} style={{ background: "#ccc" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

