import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase/firebase";
import {
  collection,
  onSnapshot,
  getDocs,
  addDoc,
  serverTimestamp,
  query
} from "firebase/firestore";
import Sidebar from "./Components/Sidebar";
import ChatWindow from "./Components/ChatWindow";
import "./Chat.css";

//test
export default function Chat() {
  const currentUserId = auth.currentUser?.uid;
  const [confirmedUsers, setConfirmedUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState({});

  // Get the full user object for the selected chat
  const selectedUser = confirmedUsers.find(user => user.id === selectedChat);

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

    fetchConfirmedMatches();
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

  return (
    <div className="chat-page">
  <Sidebar
    confirmedUsers={confirmedUsers}
    selectedChat={selectedChat}
    onSelectChat={setSelectedChat}
  />
  {selectedChat && selectedUser ? (
    <ChatWindow
      selectedChat={selectedChat}
      chatDisplayName={selectedUser.userName || "Student"}
      messages={chatMessages[selectedChat] || []}
      onSendMessage={handleSendMessage}
    />
  ) : (
    <div className="chat-placeholder">
      <h2>Select a chat to start messaging</h2>
      <p>Your confirmed matches will appear here. Click on a name to begin chatting!</p>
    </div>
  )}
</div>
  );
}
