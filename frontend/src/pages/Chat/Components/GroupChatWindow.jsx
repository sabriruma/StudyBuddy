import React, { useState, useRef, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../../firebase/firebase";
import "../Styles/ChatWindow.css";
import EditGroupModal from "./EditGroupModal";

export default function GroupChatWindow({
  group,
  messages,
  onSendMessage,
  currentUserId,
  confirmedUsers,
  onGroupUpdated
}) {
  const [newMessage, setNewMessage] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [userCache, setUserCache] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMissingUserInfo = async () => {
      const missingIds = messages
        .map((msg) => msg.from)
        .filter((uid) => uid !== currentUserId && !userCache[uid]);

      const uniqueIds = [...new Set(missingIds)];

      const newCache = {};
      for (let uid of uniqueIds) {
        try {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            newCache[uid] = userDoc.data();
          }
        } catch (error) {
          console.error("Failed to fetch user info:", error);
        }
      }

      if (Object.keys(newCache).length > 0) {
        setUserCache((prev) => ({ ...prev, ...newCache }));
      }
    };

    fetchMissingUserInfo();
  }, [messages, currentUserId, userCache]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(group.id, newMessage);
    setNewMessage("");
  };

  return (
    <div className="chat-window">
      <div className="chat-window-inner">
        <div className="chat-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src={group.avatar}
              alt="group avatar"
              style={{ width: 40, height: 40, borderRadius: "50%" }}
            />
            <h3>{group.name}</h3>
          </div>
          <button className="edit-group-btn" onClick={() => setShowEditModal(true)}>
            Edit Group
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, idx) => {
            const isCurrentUser = msg.from === currentUserId;
            const senderData = userCache[msg.from];

            return (
              <div
                key={idx}
                className={`chat-bubble ${isCurrentUser ? "outgoing" : "incoming"}`}
              >
                {!isCurrentUser && senderData && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <img
                      src={senderData.avatar}
                      alt="avatar"
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        objectFit: "cover"
                      }}
                    />
                    <strong>{`${senderData.firstName} ${senderData.lastName}`}</strong>
                  </div>
                )}
                {isCurrentUser && <strong>You</strong>}
                <p>{msg.text}</p>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
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
    </div>
  );
}

