import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { db, auth } from "../../firebase/firebase";
import {
  collection,
  onSnapshot,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  doc,
  setDoc,
  getDoc,
  orderBy,
  where
} from "firebase/firestore";
import Sidebar from "./Components/Sidebar";
import ChatWindow from "./Components/ChatWindow";

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
  const [searchParams] = useSearchParams();

  const selectedUser = confirmedUsers.find(user => user.id === selectedChat);
  const selectedGroupObj = groups.find(group => group.id === selectedGroup);

  const enhancedUsers = confirmedUsers.map((user) => ({
    ...user,
    userName: `${user.firstName} ${user.lastName}`,
  }));

  useEffect(() => {
    if (!currentUserId) return;

    const fetchConfirmedMatches = async () => {
      const ref = collection(db, `users/${currentUserId}/confirmedMatches`);
      const snapshot = await getDocs(ref);
    
      const matches = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const matchId = docSnap.id;
    
          // Fetch full user profile from 'users' collection
          const userProfileRef = doc(db, "users", matchId);
          const userProfileSnap = await getDoc(userProfileRef);
          const userProfileData = userProfileSnap.exists() ? userProfileSnap.data() : {};
    
          return {
            id: matchId,
            ...docSnap.data(),
            firstName: userProfileData.firstName || '',
            lastName: userProfileData.lastName || '',
            avatar: userProfileData.avatar || '',
            userName: `${userProfileData.firstName || ''} ${userProfileData.lastName || ''}`.trim(),
          };
        })
      );
    
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
    const groupIdFromUrl = searchParams.get("groupId");
    if (groupIdFromUrl && groups.length > 0) {
      const exists = groups.some(group => group.id === groupIdFromUrl);
      if (exists) {
        setSelectedGroup(groupIdFromUrl);
        setSelectedChat(null); // Make sure no individual chat is selected
      }
    }
  }, [searchParams, groups]);
  

useEffect(() => {
  if (!selectedChat || !currentUserId) return;

  let unsubscribe;

  const fetchAndSubscribe = async () => {
    try {
      // Step 1: Get all chats where currentUserId is a member
      const chatsRef = collection(db, "chats");
      const chatQuery = query(chatsRef, where("members", "array-contains", currentUserId));
      const chatSnap = await getDocs(chatQuery);

      // Step 2: Find the chat that also includes selectedChat
      const matchedChatDoc = chatSnap.docs.find((doc) => {
        const members = doc.data().members || [];
        return members.includes(selectedChat);
      });

      if (!matchedChatDoc) {
        console.warn("No chat found with selected user.");
        // Clear messages for this chat if no chat document exists
        setChatMessages(prev => ({ ...prev, [selectedChat]: [] }));
        return;
      }

      const chatId = matchedChatDoc.id;

      // Step 3: Listen to messages in that chat
      const messagesRef = query(
        collection(db, "chats", chatId, "messages"),
        orderBy("timestamp", "asc")
      );

      unsubscribe = onSnapshot(messagesRef, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setChatMessages(prev => ({ ...prev, [selectedChat]: msgs }));
      });

    } catch (error) {
      console.error("Error setting up chat listener:", error);
      setChatMessages(prev => ({ ...prev, [selectedChat]: [] }));
    }
  };

  fetchAndSubscribe();

  // Cleanup function
  return () => {
    if (unsubscribe && typeof unsubscribe === 'function') {
      unsubscribe();
    }
  };
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
  const chatColRef = collection(db, "chats");

  const chatQuery = query(chatColRef, where("members", "array-contains", currentUserId));
  const chatSnap = await getDocs(chatQuery);

  let existingChatDoc = chatSnap.docs.find(doc => {
    const members = doc.data().members || [];
    return members.includes(chatPartnerId);
  });

  let chatDocRef;

  if (existingChatDoc) {
    chatDocRef = doc(db, "chats", existingChatDoc.id);
  } else {
    const newDocRef = await addDoc(chatColRef, {
      members: [currentUserId, chatPartnerId],
      createdAt: serverTimestamp(),
    });
    chatDocRef = newDocRef;
  }

  const messageColRef = collection(chatDocRef, "messages");

  await addDoc(messageColRef, {
    senderId: currentUserId,
    text: messageText,
    timestamp: serverTimestamp(),
  });
};

const handleSendGroupMessage = async (groupId, messageText) => {
  try {
    const userDocRef = doc(db, "users", currentUserId);
    const userDocSnap = await getDoc(userDocRef);

    const userData = userDocSnap.exists() ? userDocSnap.data() : {};
    const senderName = `${userData.firstName || "Unknown"} ${userData.lastName || ""}`.trim();

    const messageRef = collection(db, "groups", groupId, "messages");

    await addDoc(messageRef, {
      from: currentUserId,
      senderName: senderName || "You",
      text: messageText,
      timestamp: serverTimestamp(),
    });

  } catch (error) {
    console.error("Error sending group message:", error);
  }
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
  enhancedUsers={enhancedUsers} 
  selectedChat={selectedChat}
  onSelectChat={(id) => {
    setSelectedChat(id);
    setSelectedGroup(null);
  }}
  groups={groups}
  selectedGroupId={selectedGroup}
  onSelectGroup={async (id) => {
    setSelectedGroup(id);
    setSelectedChat(null);

    const lastSeenRef = doc(db, "groups", id, "lastSeen", currentUserId);
    await setDoc(lastSeenRef, {
      timestamp: serverTimestamp(),
    });
  }}
  onCreateGroup={() => setShowCreateModal(true)}
/>


      <div style={{ width: "100%" }}>


        {selectedChat && selectedUser ? (
          <ChatWindow
            selectedChat={selectedChat}
            chatDisplayName= {selectedUser?.userName || "Student"}
            messages={chatMessages[selectedChat] || []}
            onSendMessage={handleSendMessage}
            currentUserId={currentUserId}
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
