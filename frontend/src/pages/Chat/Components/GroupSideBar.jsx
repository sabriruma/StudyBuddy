import { useEffect, useState } from "react";
import { db, auth } from "../../../firebase/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit
} from "firebase/firestore";

export default function GroupSidebar({ groups, selectedGroupId, onSelectGroup }) {
  const [unreadGroups, setUnreadGroups] = useState([]);

  useEffect(() => {
    const checkUnread = async () => {
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) return;

      const unread = [];

      for (const group of groups) {
        const lastSeenDoc = await getDoc(doc(db, "groups", group.id, "lastSeen", currentUserId));
        const lastSeen = lastSeenDoc.exists() ? lastSeenDoc.data().timestamp?.seconds || 0 : 0;

        const latestMsgQuery = query(collection(db, "groups", group.id, "messages"), orderBy("timestamp", "desc"), limit(1));
        const latestMsgSnap = await getDocs(latestMsgQuery);
        const latestMsg = latestMsgSnap.docs[0]?.data();
        const latestTime = latestMsg?.timestamp?.seconds || 0;

        if (latestTime > lastSeen) {
          unread.push(group.id);
        }
      }

      setUnreadGroups(unread);
    };

    checkUnread();
  }, [groups]);

  return (
    <div className="sidebar">
      <h2>Group Chats</h2>
      <ul className="chat-list">
        {groups.map(group => (
          <li
            key={group.id}
            className={selectedGroupId === group.id ? "active" : ""}
            onClick={() => onSelectGroup(group.id)}
          >
            <img
              src={group.avatar}
              alt="group"
              style={{ width: 30, height: 30, borderRadius: "50%", marginRight: 10 }}
            />
            {group.name}
            {unreadGroups.includes(group.id) && (
              <span className="unread-indicator">●</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

