import React, { useState } from "react";
import { db, auth } from "../../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const avatarOptions = ["/group1.png", "/group2.png", "/group3.png"];

export default function CreateGroupModal({
  confirmedUsers,
  onClose,
  onGroupCreated,
}) {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);
  const [dropdownValue, setDropdownValue] = useState("");

  const currentUserId = auth.currentUser?.uid;

  // Clean and deduplicate confirmedUsers
  const cleanedConfirmedUsers = confirmedUsers.filter(
    (u, index, self) =>
      u &&
      u.userId &&
      u.userName &&
      index === self.findIndex((other) => other.userId === u.userId)
  );

  const addUser = (userId) => {
    if (userId && !selectedUsers.includes(userId)) {
      setSelectedUsers((prev) => [...prev, userId]);
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
      createdAt: serverTimestamp(),
    });

    onGroupCreated();
    onClose();
  };
  console.log("confirmedUsers:", confirmedUsers);
  console.log("cleanedConfirmedUsers:", cleanedConfirmedUsers);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center z-[999]">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl w-96 max-h-[90vh] overflow-y-auto shadow-xl dark:shadow-2xl dark:border dark:border-gray-700">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
          Create Group
        </h2>

        <input
          type="text"
          placeholder="Enter group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          maxLength={25}
          className="w-full p-3 mb-5 rounded-lg !border !border-gray-300 dark:!border-gray-600 text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <h4 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">
          Choose a group photo:
        </h4>
        <div className="flex gap-3 mb-5">
          {avatarOptions.map((avatar, idx) => (
            <img
              key={idx}
              src={avatar}
              alt={`Group avatar ${idx + 1}`}
              onClick={() => setSelectedAvatar(avatar)}
              className={`w-15 h-15 object-cover rounded-full cursor-pointer transition-all duration-200 ${
                selectedAvatar === avatar
                  ? "border-3 border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
                  : "border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
              style={{ width: "60px", height: "60px" }}
            />
          ))}
        </div>

        <h4 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">
          Add users to group:
        </h4>
        <div className="mb-3">
          <select
            value={dropdownValue}
            onChange={(e) => addUser(e.target.value)}
            className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option
              value=""
              disabled
              hidden
              className="text-gray-500 dark:text-gray-400"
            >
              -- Select user to add --
            </option>
            {cleanedConfirmedUsers
              .filter((user) => !selectedUsers.includes(user.otherUserId))
              .map((user) => (
                <option
                  key={user.userId}
                  value={user.userId}
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {user.userName}
                </option>
              ))}
          </select>
        </div>

        {selectedUsers.length > 0 && (
          <ul className="list-none p-3 mb-5 max-h-36 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            {selectedUsers.map((userId) => {
              const user = cleanedConfirmedUsers.find(
                (u) => u.userId === userId
              );
              return (
                <li
                  key={userId}
                  className="text-gray-700 dark:text-gray-300 py-1 flex flex-1 items-center"
                >
                  <img src={user.avatar} className="w-8 h-8" />
                  {user?.userName}
                </li>
              );
            })}
          </ul>
        )}
        <div className="flex justify-between gap-3">
          <button
            onClick={handleCreateGroup}
            className="px-4 py-2.5 text-sm font-medium rounded-lg border-none cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white transition-colors duration-200 flex-1"
          >
            Create Group
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium rounded-lg border-none cursor-pointer bg-gray-400 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700 text-white transition-colors duration-200 flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
