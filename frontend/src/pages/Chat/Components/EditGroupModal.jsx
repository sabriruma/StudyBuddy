import React, { useState } from "react";
import { db } from "../../../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
import "../CreateGroupModal.css";

export default function EditGroupModal({ group, confirmedUsers, onClose, onGroupUpdated }) {
  const [updatedMembers, setUpdatedMembers] = useState(group.members);
  const [dropdownValue, setDropdownValue] = useState("");

  const handleRemoveUser = (userId) => {
    setUpdatedMembers(prev => prev.filter(id => id !== userId));
  };

  const handleAddUser = () => {
    if (dropdownValue && !updatedMembers.includes(dropdownValue)) {
      setUpdatedMembers(prev => [...prev, dropdownValue]);
      setDropdownValue("");
    }
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

    onGroupUpdated();
    onClose();
  };

  return (
    <div className="group-modal-overlay">
      <div className="group-modal">
        <h2>Edit Group Members</h2>

        {updatedMembers.map(userId => {
          const user = confirmedUsers.find(u => u.id === userId);
          return user ? (
            <div key={userId} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span>{user.userName}</span>
              <button onClick={() => handleRemoveUser(userId)}>Remove</button>
            </div>
          ) : null;
        })}

        <h4>Add member:</h4>
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <select
            value={dropdownValue}
            onChange={(e) => setDropdownValue(e.target.value)}
            style={{ flex: 1, padding: "8px", borderRadius: "6px" }}
          >
            <option value="" disabled hidden>-- Select user to add --</option>
            {confirmedUsers
              .filter(
                user =>
                  user?.id &&
                  user?.userName &&
                  !updatedMembers.includes(user.id)
              )
              .map(user => (
                <option key={user.id} value={user.id}>
                  {user.userName}
                </option>
              ))}
          </select>
          <button onClick={handleAddUser}>Add</button>
        </div>

        <div className="modal-actions">
          <button onClick={handleSaveChanges}>Save Changes</button>
          <button onClick={onClose} style={{ background: "#ccc" }}>Close</button>
        </div>
      </div>
    </div>
  );
}






