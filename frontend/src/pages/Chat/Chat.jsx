import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase/firebase";
import {
  collection,
  onSnapshot,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  doc,
  setDoc
} from "firebase/firestore";
import Sidebar from "./Components/Sidebar";
import ChatWindow from "./Components/ChatWindow";
import GroupSidebar from "./Components/GroupSideBar";
import GroupChatWindow from "./Components/GroupChatWindow";
import CreateGroupModal from "./CreateGroupModal.jsx";
import "./Chat.css";

export default function Chat() {
  const currentUserId = auth.currentUser?.uid;
  const [confirmedUsers, setConfirmedUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [groupMessages, setGroupMessages] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false); // ✅ Modal control

  const selectedUser = confirmedUsers.find(user => user.id === selectedChat);
  const selectedGroupObj = groups.find(group => group.id === selectedGroup);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchConfirmedMatches = async () => {
      const ref = collection(db, `users/${currentUserId}/confirmedMatches`);
      const snapshot = await getDocs(ref);
      const matches = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setConfirmedUsers(matches);
    };

    const fetchGroups = async () => {
      const ref = collection(db, "groups");
      const snapshot = await getDocs(ref);
      const myGroups = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(group => group.members.includes(currentUserId));
      setGroups(myGroups);
    };

    fetchConfirmedMatches();
    fetchGroups();
  }, [currentUserId]);

  useEffect(() => {
    if (!selectedChat || !currentUserId) return;

    const chatId = [currentUserId, selectedChat].sort().join("_");
    const messagesRef = query(collection(db, "chats", chatId, "messages"));

    const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
      const msgs = snapshot.docs.map(doc => doc.data()).sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds);
      setChatMessages(prev => ({ ...prev, [selectedChat]: msgs }));
    });

    return () => unsubscribe();
  }, [selectedChat, currentUserId]);

  useEffect(() => {
    if (!selectedGroup || !currentUserId) return;

    const messagesRef = query(collection(db, "groups", selectedGroup, "messages"));

    const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
      const msgs = snapshot.docs.map(doc => doc.data()).sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds);
      setGroupMessages(prev => ({ ...prev, [selectedGroup]: msgs }));
    });

    return () => unsubscribe();
  }, [selectedGroup, currentUserId]);

  const handleSendMessage = async (chatPartnerId, messageText) => {
    const chatId = [currentUserId, chatPartnerId].sort().join("_");
    const messageRef = collection(db, "chats", chatId, "messages");

    await addDoc(messageRef, {
      from: currentUserId,
      to: chatPartnerId,
      text: messageText,
      timestamp: serverTimestamp()
    });
  };

  const handleSendGroupMessage = async (groupId, messageText) => {
    const messageRef = collection(db, "groups", groupId, "messages");
    const sender = confirmedUsers.find(user => user.id === currentUserId);

    await addDoc(messageRef, {
      from: currentUserId,
      senderName: sender?.userName || "You",
      text: messageText,
      timestamp: serverTimestamp()
    });
  };

  const onGroupUpdated = async () => {
    const ref = collection(db, "groups");
    const snapshot = await getDocs(ref);
    const myGroups = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(group => group.members.includes(currentUserId));
    setGroups(myGroups);
  };

  const handleGroupCreated = async () => {
    await onGroupUpdated();
    setShowCreateModal(false);
  };

  return (
    <div className="chat-page">
      <Sidebar
        confirmedUsers={confirmedUsers}
        selectedChat={selectedChat}
        onSelectChat={(id) => {
          setSelectedChat(id);
          setSelectedGroup(null);
        }}
      />

      <div style={{ width: "100%" }}>
        <div className="group-header">
          <h2>Group Chats</h2>
          <button onClick={() => setShowCreateModal(true)}>+ Create Group</button>
        </div>

        <GroupSidebar
          groups={groups}
          selectedGroupId={selectedGroup}
          onSelectGroup={async (id) => {
            setSelectedGroup(id);
            setSelectedChat(null);

            const lastSeenRef = doc(db, "groups", id, "lastSeen", currentUserId);
            await setDoc(lastSeenRef, {
              timestamp: serverTimestamp()
            });
          }}
        />

        {selectedChat && selectedUser ? (
          <ChatWindow
            selectedChat={selectedChat}
            chatDisplayName={selectedUser.userName || "Student"}
            messages={chatMessages[selectedChat] || []}
            onSendMessage={handleSendMessage}
          />
        ) : selectedGroup && selectedGroupObj ? (
          <GroupChatWindow
            group={selectedGroupObj}
            messages={groupMessages[selectedGroup] || []}
            onSendMessage={handleSendGroupMessage}
            currentUserId={currentUserId}
            confirmedUsers={confirmedUsers}
            onGroupUpdated={onGroupUpdated}
          />
        ) : (
          <div className="chat-placeholder">
            <h2>Select a chat to start messaging</h2>
            <p>Your confirmed matches and group chats will appear here. Click on one to begin!</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateGroupModal
          confirmedUsers={confirmedUsers}
          onClose={() => setShowCreateModal(false)}
          onGroupCreated={handleGroupCreated}
        />
      )}
    </div>
  );
}
