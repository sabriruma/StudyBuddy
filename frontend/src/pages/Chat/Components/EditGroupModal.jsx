import React, { useState } from "react";
import { db, auth } from "../../../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
import "../CreateGroupModal.css";

export default function EditGroupModal({ group, confirmedUsers, onClose, onGroupUpdated }) {
  const [updatedMembers, setUpdatedMembers] = useState(group.members);

  const toggleUser = (userId) => {
    setUpdatedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSaveChanges = async () => {
    if (updatedMembers.length < 2) {
      alert("Group must have at least two members.");
      return;
    }

    const groupRef = doc(db, "groups", group.id);
    await updateDoc(groupRef, {
      members: updatedMembers
    });

    onGroupUpdated(); // optional callback
    onClose();
  };

  return (
    <div className="group-modal-overlay">
      <div className="group-modal">
        <h2>Edit Group Members</h2>

        <ul className="user-list">
          {confirmedUsers.map(user => (
            <li key={user.id}>
              <label>
                <input
                  type="checkbox"
                  checked={updatedMembers.includes(user.id)}
                  onChange={() => toggleUser(user.id)}
                />
                {user.userName}
              </label>
            </li>
          ))}
        </ul>

        <div className="modal-actions">
          <button onClick={handleSaveChanges}>Save Changes</button>
          <button onClick={onClose} style={{ background: "#ccc" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
