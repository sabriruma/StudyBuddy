import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useParams, useSearchParams } from "react-router-dom";
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
  limit,
} from "firebase/firestore";
import CreateGroupModal from "../pages/Chat/CreateGroupModal";

// Timestamp formatting utility
const formatTimestamp = (timestamp) => {
  if (!timestamp?.seconds) return "Just now";

  const date = new Date(timestamp.seconds * 1000);
  const now = new Date();
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return `Today at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (diffInDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (diffInDays < 7) {
    return `${date.toLocaleDateString([], {
      weekday: "short",
    })} at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else {
    return `${date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    })} at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
};

export default function Chat() {
  const params = useParams();
  const [searchParams] = useSearchParams();

  // Add authentication state management
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  const [confirmedUsers, setConfirmedUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [groupMessages, setGroupMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("private");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [individualChats, setIndividualChats] = useState([]);
  const [forceRefresh, setForceRefresh] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Check URL params or search params for chatId or groupId
    const urlChatId = params.chatId || searchParams.get("chatId");
    const urlGroupId = params.groupId || searchParams.get("groupId");

    if (urlChatId) {
      setSelectedChat(urlChatId);
      setSelectedGroup(null);
      setActiveTab("private");
      console.log("Auto-selecting chat from URL:", urlChatId);
    } else if (urlGroupId) {
      setSelectedGroup(urlGroupId);
      setSelectedChat(null);
      setActiveTab("group");
      console.log("Auto-selecting group from URL:", urlGroupId);
    }
  }, [params, searchParams]);

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user?.uid);
      setCurrentUserId(user?.uid || null);
      setIsAuthLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  const selectedUser = confirmedUsers.find((user) => user.id === selectedChat);
  const selectedGroupObj = groups.find((group) => group.id === selectedGroup);

  const enhancedUsers = confirmedUsers.map((user) => ({
    ...user,
    userName: `${user.firstName} ${user.lastName}`,
  }));

  // Modified useEffect to wait for auth state
  useEffect(() => {
    // Don't run if auth isn't loaded yet or user isn't authenticated
    if (!isAuthLoaded || !currentUserId) {
      console.log("Waiting for auth:", { isAuthLoaded, currentUserId });
      return;
    }

    console.log("Fetching data for user:", currentUserId);

    const fetchConfirmedMatches = async () => {
      try {
        console.log("Fetching confirmed matches...");
        const ref = collection(db, `users/${currentUserId}/confirmedMatches`);
        const snapshot = await getDocs(ref);
        console.log("Confirmed matches snapshot:", snapshot.docs.length);

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
              avatar: userProfileData.avatar || "/avatars/default.png",
              userName:
                `${userProfileData.firstName || ""} ${
                  userProfileData.lastName || ""
                }`.trim() || "Student",
              chatId,
            };
          })
        );

        console.log("Processed matches:", matches);
        setConfirmedUsers(matches);
      } catch (error) {
        console.error("Error fetching confirmed matches:", error);
      }
    };

    const fetchGroups = async () => {
      try {
        console.log("Fetching groups...");
        const ref = collection(db, "groups");
        const snapshot = await getDocs(ref);
        console.log("Groups snapshot:", snapshot.docs.length);

        const myGroups = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((group) => group.members.includes(currentUserId));

        console.log("My groups:", myGroups);

        const enrichedGroups = await Promise.all(
          myGroups.map(async (group) => {
            const messagesRef = collection(db, "groups", group.id, "messages");
            const latestQuery = query(
              messagesRef,
              orderBy("timestamp", "desc"),
              limit(1)
            );
            const latestSnap = await getDocs(latestQuery);
            const lastMessage = latestSnap.docs[0]?.data();

            return {
              ...group,
              lastMessage,
              unreadCount: 0,
            };
          })
        );

        console.log("Enriched groups:", enrichedGroups);
        setGroups(enrichedGroups);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    const fetchIndividualChats = async () => {
      try {
        console.log("Fetching individual chats...");
        const chatQuery = query(
          collection(db, "chats"),
          where("members", "array-contains", currentUserId)
        );
        const chatSnap = await getDocs(chatQuery);
        console.log("Individual chats snapshot:", chatSnap.docs.length);

        const chats = chatSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        const enrichedChats = await Promise.all(
          chats.map(async (chat) => {
            const chatId = chat.id;

            const messagesRef = collection(db, "chats", chatId, "messages");
            const latestQuery = query(
              messagesRef,
              orderBy("timestamp", "desc"),
              limit(1)
            );
            const latestSnap = await getDocs(latestQuery);
            const lastMessageDoc = latestSnap.docs[0];

            if (!lastMessageDoc) return null;

            const lastMessage = lastMessageDoc.data();

            const otherUserId = chat.members.find((id) => id !== currentUserId);
            if (!otherUserId) return null;

            const userDoc = await getDoc(doc(db, "users", otherUserId));
            const userData = userDoc.exists() ? userDoc.data() : {};

            return {
              chatId,
              otherUserId,
              displayName: `${userData.firstName || "Unknown"} ${
                userData.lastName || ""
              }`.trim(),
              avatar: userData.avatar || "/defaultAvatar.png",
              lastMessage,
            };
          })
        );

        const validChats = enrichedChats.filter(Boolean);
        console.log("Individual chats processed:", validChats);
        setIndividualChats(validChats);

        // Update confirmedUsers with individual chats data
        setConfirmedUsers(validChats);
      } catch (error) {
        console.error("Error fetching individual chats:", error);
      }
    };

    // Execute all fetch functions
    Promise.all([
      fetchConfirmedMatches(),
      fetchGroups(),
      fetchIndividualChats(),
    ])
      .then(() => {
        console.log("All data fetched successfully");
      })
      .catch((error) => {
        console.error("Error in data fetching:", error);
      });
  }, [currentUserId, isAuthLoaded]); // Added isAuthLoaded dependency

  useEffect(() => {
    if (!selectedChat || !currentUserId || activeTab !== "private") return;

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

    const timeoutId = setTimeout(() => {
      fetchAndSubscribe();
    }, 100);

    const retryTimeoutId = setTimeout(() => {
      if (
        !chatMessages[selectedChat] ||
        chatMessages[selectedChat].length === 0
      ) {
        fetchAndSubscribe();
      }
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(retryTimeoutId);
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [selectedChat, currentUserId, activeTab, forceRefresh]);

  useEffect(() => {
    if (!selectedGroup || !currentUserId || activeTab !== "group") return;

    const messagesRef = query(
      collection(db, "groups", selectedGroup, "messages")
    );

    const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
      const msgs = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds);
      setGroupMessages((prev) => ({ ...prev, [selectedGroup]: msgs }));
    });

    return () => unsubscribe();
  }, [selectedGroup, currentUserId, activeTab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, groupMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    if (activeTab === "private" && selectedChat) {
      const chatPartnerId = selectedChat;
      const messageText = newMessage;

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
        from: currentUserId,
        text: messageText,
        timestamp: serverTimestamp(),
      });

      if (isNewChat) {
        const ref = collection(db, `users/${currentUserId}/confirmedMatches`);
        const snapshot = await getDocs(ref);

        const matches = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const matchId = docSnap.id;

            const userProfileRef = doc(db, "users", matchId);
            const userProfileSnap = await getDoc(userProfileRef);
            const userProfileData = userProfileSnap.exists()
              ? userProfileSnap.data()
              : {};

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
        setForceRefresh((prev) => prev + 1);

        const newMessageObj = {
          id: messageRef.id,
          senderId: currentUserId,
          from: currentUserId,
          text: messageText,
          timestamp: new Date(),
        };

        setChatMessages((prev) => ({
          ...prev,
          [chatPartnerId]: [...(prev[chatPartnerId] || []), newMessageObj],
        }));
      }
    } else if (activeTab === "group" && selectedGroup) {
      try {
        const userDocRef = doc(db, "users", currentUserId);
        const userDocSnap = await getDoc(userDocRef);

        const userData = userDocSnap.exists() ? userDocSnap.data() : {};
        const senderName = `${userData.firstName || "Unknown"} ${
          userData.lastName || ""
        }`.trim();

        const messageRef = collection(db, "groups", selectedGroup, "messages");

        await addDoc(messageRef, {
          from: currentUserId,
          senderName: senderName || "You",
          text: newMessage,
          timestamp: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error sending group message:", error);
      }
    }

    setNewMessage("");
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

  // Add loading state
  if (!isAuthLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Please log in to access chat</div>
      </div>
    );
  }

  console.log("Rendering with individualChats:", individualChats);
  console.log("Rendering with groups:", groups);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* User Chat List */}
      <div className="w-1/4 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Chats
          </h1>

          {/* Tab Switcher */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setActiveTab("private");
                setSelectedGroup(null);
              }}
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === "private"
                  ? "text-teal-500 border-b-2 border-teal-500"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Private
            </button>
            <button
              onClick={() => {
                setActiveTab("group");
                setSelectedChat(null);
              }}
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === "group"
                  ? "text-teal-500 border-b-2 border-teal-500"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Group
            </button>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100%-108px)]">
          {activeTab === "private" ? (
            confirmedUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  setSelectedChat(user.otherUserId);
                  setSelectedGroup(null);
                }}
                className={`flex items-center p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                  selectedChat === user.otherUserId
                    ? "bg-teal-50 dark:bg-teal-900"
                    : ""
                }`}
              >
                <img
                  src={user.avatar}
                  alt={user.userName}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 dark:text-white truncate">
                    {user.displayName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.lastMessage?.text || "No messages yet"}
                  </p>
                </div>
                {chatMessages[user.id]?.[chatMessages[user.id]?.length - 1]
                  ?.timestamp && (
                  <div className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                    {
                      formatTimestamp(
                        chatMessages[user.id][chatMessages[user.id].length - 1]
                          .timestamp
                      ).split(" at ")[0]
                    }
                  </div>
                )}
              </div>
            ))
          ) : (
            <>
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full p-3 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium"
              >
                Create New Group
              </button>
              {groups.map((group) => (
                <div
                  key={group.id}
                  onClick={async () => {
                    setSelectedGroup(group.id);
                    setSelectedChat(null);

                    const lastSeenRef = doc(
                      db,
                      "groups",
                      group.id,
                      "lastSeen",
                      currentUserId
                    );
                    await setDoc(lastSeenRef, {
                      timestamp: serverTimestamp(),
                    });
                  }}
                  className={`flex items-center p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                    selectedGroup === group.id
                      ? "bg-teal-50 dark:bg-teal-900"
                      : ""
                  }`}
                >
                  <img
                    className="w-10 h-10 rounded-full object-contain mr-3 bg-gray-300 dark:bg-gray-600 flex items-center justify-center"
                    src={group.avatar}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 dark:text-white truncate">
                      {group.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {group?.lastMessage?.text || "No messages yet"}
                    </p>
                  </div>
                  {groupMessages[group.id]?.[
                    groupMessages[group.id]?.length - 1
                  ]?.timestamp && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                      {
                        formatTimestamp(
                          groupMessages[group.id][
                            groupMessages[group.id].length - 1
                          ].timestamp
                        ).split(" at ")[0]
                      }
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          {activeTab === "group" && selectedGroupObj ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full mr-3 bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-lg">👥</span>
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 dark:text-white">
                    {selectedGroupObj.name}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedGroupObj.members.length} members
                  </p>
                </div>
              </div>
              <button
                className="text-sm text-teal-500 hover:text-teal-600"
                onClick={() => setShowCreateModal(true)}
              >
                Manage Group
              </button>
            </div>
          ) : selectedUser ? (
            <div className="flex items-center">
              <img
                src={selectedUser.avatar}
                alt={selectedUser.userName}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <h2 className="font-bold text-gray-800 dark:text-white">
                  {selectedUser.userName}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {chatMessages[selectedChat]?.length ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-gray-600 dark:text-gray-300">
              {activeTab === "group"
                ? "Select a group chat"
                : "Select a chat to start messaging"}
            </div>
          )}
        </div>

        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-700">
          {activeTab === "group" && selectedGroupObj ? (
            groupMessages[selectedGroup]?.length ? (
              groupMessages[selectedGroup].map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-4 ${
                    msg.from === currentUserId ? "text-right" : "text-left"
                  }`}
                >
                  {msg.from !== currentUserId && (
                    <div className="text-xs text-gray-500 dark:text-gray-300 mb-1">
                      {msg.senderName}
                    </div>
                  )}
                  <div
                    className={`inline-block px-4 py-2 rounded-lg max-w-xs md:max-w-md ${
                      msg.from === currentUserId
                        ? "bg-teal-500 text-white"
                        : "bg-white dark:bg-gray-600 text-gray-800 dark:text-white"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                    {formatTimestamp(msg.timestamp)}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                Start a new group conversation
              </div>
            )
          ) : chatMessages[selectedChat]?.length ? (
            chatMessages[selectedChat].map((msg) => (
              <div
                key={msg.id}
                className={`mb-4 ${
                  msg.from === currentUserId || msg.senderId === currentUserId
                    ? "text-right"
                    : "text-left"
                }`}
              >
                {msg.from !== currentUserId &&
                  msg.senderId !== currentUserId && (
                    <div className="text-xs text-gray-500 dark:text-gray-300 mb-1">
                      {selectedUser?.userName}
                    </div>
                  )}
                <div
                  className={`inline-block px-4 py-2 rounded-lg max-w-xs md:max-w-md ${
                    msg.from === currentUserId || msg.senderId === currentUserId
                      ? "bg-teal-500 text-white"
                      : "bg-white dark:bg-gray-600 text-gray-800 dark:text-white"
                  }`}
                >
                  {msg.text}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                  {formatTimestamp(msg.timestamp)}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              {selectedChat || selectedGroup
                ? "Start a new conversation"
                : "Select a chat to begin"}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        {(selectedChat || selectedGroup) && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={`Type a ${
                  activeTab === "group" ? "group" : ""
                } message...`}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-l-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-r-lg disabled:opacity-50"
              >
                Send
              </button>
            </div>
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
