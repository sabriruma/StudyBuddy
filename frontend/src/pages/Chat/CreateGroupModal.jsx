import React, { useState } from "react";
import { db, auth } from "../../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import "./CreateGroupModal.css";

const avatarOptions = ["/group1.png", "/group2.png", "/group3.png"];

export default function CreateGroupModal({ confirmedUsers, onClose, onGroupCreated }) {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);
  const [dropdownValue, setDropdownValue] = useState("");

  const currentUserId = auth.currentUser?.uid;

  // Clean and deduplicate confirmedUsers
  const cleanedConfirmedUsers = confirmedUsers.filter(
    (u, index, self) =>
      u && u.id && u.userName &&
      index === self.findIndex(other => other.id === u.id)
  );

  const addUser = (userId) => {
    if (userId && !selectedUsers.includes(userId)) {
      setSelectedUsers(prev => [...prev, userId]);
      setDropdownValue(""); // Reset dropdown
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedUsers.length === 0) return;

    const groupRef = collection(db, "groups");

    await addDoc(groupRef, {
      name: groupName,
      avatar: selectedAvatar,
      members: [...selectedUsers, currentUserId],
      createdBy: currentUserId,
      createdAt: serverTimestamp()
    });

    onGroupCreated();
    onClose();
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
        <div style={{ marginBottom: "10px" }}>
          <select
            value={dropdownValue}
            onChange={(e) => addUser(e.target.value)}
            style={{ width: "100%", padding: "8px", borderRadius: "6px" }}
          >
            <option value="" disabled hidden>-- Select user to add --</option>
            {cleanedConfirmedUsers
              .filter(user => !selectedUsers.includes(user.id))
              .map(user => (
                <option key={user.id} value={user.id}>
                  {user.userName}
                </option>
              ))}
          </select>
        </div>

        {selectedUsers.length > 0 && (
          <ul className="user-list">
            {selectedUsers.map(userId => {
              const user = cleanedConfirmedUsers.find(u => u.id === userId);
              return (
                <li key={userId}>{user?.userName}</li>
              );
            })}
          </ul>
        )}

        <div className="modal-actions">
          <button onClick={handleCreateGroup}>Create Group</button>
          <button onClick={onClose} style={{ background: "#ccc" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}









