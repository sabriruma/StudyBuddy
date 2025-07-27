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
  where,
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchParams] = useSearchParams();
  const chatIdParam = searchParams.get("chatId");
  const groupIdParam = searchParams.get("groupId");
  const [individualChats, setIndividualChats] = useState([]);
  const [forceRefresh, setForceRefresh] = useState(0);

  const selectedUser = confirmedUsers.find((user) => user.id === selectedChat);
  const selectedGroupObj = groups.find((group) => group.id === selectedGroup);

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
          const userProfileData = userProfileSnap.exists()
            ? userProfileSnap.data()
            : {};

          // Find chat document with both users in 'members'
          let chatId = null;
          const chatsQuery = query(
            collection(db, "chats"),
            where("members", "array-contains", currentUserId)
          );
          const chatsSnapshot = await getDocs(chatsQuery);

          const existingChat = chatsSnapshot.docs.find((chatDoc) => {
            const members = chatDoc.data().members || [];
            return members.includes(matchId);
          });

          if (existingChat) {
            chatId = existingChat.id;
          }

          return {
            id: matchId,
            ...docSnap.data(),
            firstName: userProfileData.firstName || "",
            lastName: userProfileData.lastName || "",
            avatar: userProfileData.avatar || "",
            userName: `${userProfileData.firstName || ""} ${
              userProfileData.lastName || ""
            }`.trim(),
            chatId, // Add the found chatId (or null if not found)
          };
        })
      );

      setConfirmedUsers(matches);
    };

    const fetchGroups = async () => {
      const ref = collection(db, "groups");
      const snapshot = await getDocs(ref);
      const myGroups = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((group) => group.members.includes(currentUserId));
      setGroups(myGroups);
    };

    const fetchIndividualChats = async () => {
      const chatColRef = collection(db, "chats");
      const chatQuery = query(
        chatColRef,
        where("members", "array-contains", currentUserId)
      );
      const chatSnap = await getDocs(chatQuery);

      const chats = await Promise.all(
        chatSnap.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const otherUserId = data.members.find((id) => id !== currentUserId);

          // Get user info
          const userRef = doc(db, "users", otherUserId);
          const userSnap = await getDoc(userRef);
          const user = userSnap.exists() ? userSnap.data() : {};

          return {
            chatId: docSnap.id,
            otherUserId,
            displayName: `${user.firstName || ""} ${
              user.lastName || ""
            }`.trim(),
            avatar: user.avatar || "/defaultAvatar.png",
            lastMessage: data.lastMessage || null,
          };
        })
      );

      setIndividualChats(chats);
    };

    fetchConfirmedMatches();
    fetchGroups();
    fetchIndividualChats();
  }, [currentUserId]);

  useEffect(() => {
    if (chatIdParam) {
      setSelectedGroup(null);
      setSelectedChat(chatIdParam);
    } else if (groupIdParam) {
      setSelectedChat(null);
      setSelectedGroup(groupIdParam);
    }
  }, [chatIdParam, groupIdParam]);

  useEffect(() => {
    if (!selectedChat || !currentUserId) return;

    let unsubscribe;

    const fetchAndSubscribe = async () => {
      try {
        // Step 1: Get all chats where currentUserId is a member
        const chatsRef = collection(db, "chats");
        const chatQuery = query(
          chatsRef,
          where("members", "array-contains", currentUserId)
        );
        const chatSnap = await getDocs(chatQuery);

        // Step 2: Find the chat that also includes selectedChat
        const matchedChatDoc = chatSnap.docs.find((doc) => {
          const members = doc.data().members || [];
          return members.includes(selectedChat);
        });

        if (!matchedChatDoc) {
          console.warn("No chat found with selected user.");
          // Clear messages for this chat if no chat document exists
          setChatMessages((prev) => ({ ...prev, [selectedChat]: [] }));
          return;
        }

        const chatId = matchedChatDoc.id;

        // Step 3: Listen to messages in that chat
        const messagesRef = query(
          collection(db, "chats", chatId, "messages"),
          orderBy("timestamp", "asc")
        );

        unsubscribe = onSnapshot(messagesRef, (snapshot) => {
          const msgs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setChatMessages((prev) => ({ ...prev, [selectedChat]: msgs }));
        });
      } catch (error) {
        console.error("Error setting up chat listener:", error);
        setChatMessages((prev) => ({ ...prev, [selectedChat]: [] }));
      }
    };

    // Add a small delay to ensure any pending database operations are complete
    const timeoutId = setTimeout(() => {
      fetchAndSubscribe();
    }, 100);

    // Also set up a retry mechanism in case the chat doesn't exist yet
    const retryTimeoutId = setTimeout(() => {
      // Check if we still don't have messages for this chat
      if (!chatMessages[selectedChat] || chatMessages[selectedChat].length === 0) {
        fetchAndSubscribe();
      }
    }, 1000);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(retryTimeoutId);
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [selectedChat, currentUserId, forceRefresh]);

  useEffect(() => {
    if (!selectedGroup || !currentUserId) return;

    const messagesRef = query(
      collection(db, "groups", selectedGroup, "messages")
    );

    const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
      const msgs = snapshot.docs
        .map((doc) => doc.data())
        .sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds);
      setGroupMessages((prev) => ({ ...prev, [selectedGroup]: msgs }));
    });

    return () => unsubscribe();
  }, [selectedGroup, currentUserId]);

  const handleSendMessage = async (chatPartnerId, messageText) => {
    const chatColRef = collection(db, "chats");

    const chatQuery = query(
      chatColRef,
      where("members", "array-contains", currentUserId)
    );
    const chatSnap = await getDocs(chatQuery);

    let existingChatDoc = chatSnap.docs.find((doc) => {
      const members = doc.data().members || [];
      return members.includes(chatPartnerId);
    });

    let chatDocRef;
    let isNewChat = false;

    if (existingChatDoc) {
      chatDocRef = doc(db, "chats", existingChatDoc.id);
    } else {
      const newDocRef = await addDoc(chatColRef, {
        members: [currentUserId, chatPartnerId],
        createdAt: serverTimestamp(),
      });
      chatDocRef = newDocRef;
      isNewChat = true;
    }

    const messageColRef = collection(chatDocRef, "messages");

    const messageRef = await addDoc(messageColRef, {
      senderId: currentUserId,
      text: messageText,
      timestamp: serverTimestamp(),
    });
    
    // If this was a new chat, we need to trigger a re-fetch of the chat list
    // to update the chatId in the confirmedUsers
    if (isNewChat) {
      // Force a re-fetch of confirmed users to get the new chatId
      const ref = collection(db, `users/${currentUserId}/confirmedMatches`);
      const snapshot = await getDocs(ref);

      const matches = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const matchId = docSnap.id;

          // Fetch full user profile from 'users' collection
          const userProfileRef = doc(db, "users", matchId);
          const userProfileSnap = await getDoc(userProfileRef);
          const userProfileData = userProfileSnap.exists()
            ? userProfileSnap.data()
            : {};

          // Find chat document with both users in 'members'
          let chatId = null;
          const chatsQuery = query(
            collection(db, "chats"),
            where("members", "array-contains", currentUserId)
          );
          const chatsSnapshot = await getDocs(chatsQuery);

          const existingChat = chatsSnapshot.docs.find((chatDoc) => {
            const members = chatDoc.data().members || [];
            return members.includes(matchId);
          });

          if (existingChat) {
            chatId = existingChat.id;
          }

          return {
            id: matchId,
            ...docSnap.data(),
            firstName: userProfileData.firstName || "",
            lastName: userProfileData.lastName || "",
            avatar: userProfileData.avatar || "",
            userName: `${userProfileData.firstName || ""} ${
              userProfileData.lastName || ""
            }`.trim(),
            chatId,
          };
        })
      );

      setConfirmedUsers(matches);
      
      // Force the listener to refresh by incrementing the forceRefresh counter
      setForceRefresh(prev => prev + 1);
      
      // Also immediately add the message to the local state to show it right away
      const newMessage = {
        id: messageRef.id,
        senderId: currentUserId,
        text: messageText,
        timestamp: new Date(),
      };
      
      setChatMessages((prev) => ({
        ...prev,
        [chatPartnerId]: [...(prev[chatPartnerId] || []), newMessage]
      }));
    }
  };

  const handleSendGroupMessage = async (groupId, messageText) => {
    try {
      const userDocRef = doc(db, "users", currentUserId);
      const userDocSnap = await getDoc(userDocRef);

      const userData = userDocSnap.exists() ? userDocSnap.data() : {};
      const senderName = `${userData.firstName || "Unknown"} ${
        userData.lastName || ""
      }`.trim();

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
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((group) => group.members.includes(currentUserId));
    setGroups(myGroups);
  };

  const handleGroupCreated = async () => {
    await onGroupUpdated();
    setShowCreateModal(false);
  };

  console.log("selectedChat:", selectedChat);
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
            chatDisplayName={selectedUser?.userName || "Student"}
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
            chatId={selectedChat}
          />
        ) : (
          <div className="chat-placeholder">
            <h2>Select a chat to start messaging</h2>
            <p>
              Your confirmed matches and group chats will appear here. Click on
              one to begin!
            </p>
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
