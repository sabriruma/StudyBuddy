import React, { useState } from "react";
import Sidebar from "./Components/Sidebar";
import ChatWindow from "./Components/ChatWindow";
import "./Chat.css";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState("Alice");

  const [chatMessages, setChatMessages] = useState({
    Alice: [
      { from: "me", text: "Hi Alice!" },
      { from: "Alice", text: "Hey! How's it going?" }
    ],
    Bob: [
      { from: "me", text: "Hi Bob!" },
      { from: "Bob", text: "Yo! What's up?" }
    ],
    Charlie: [
      { from: "me", text: "Hey Charlie!" },
      { from: "Charlie", text: "Hi!" }
    ],
    Dana: [
      { from: "me", text: "Hello Dana!" },
      { from: "Dana", text: "Hey there!" }
    ]
  });

  const handleSendMessage = (chatName, messageText) => {
    setChatMessages((prevMessages) => ({
      ...prevMessages,
      [chatName]: [...(prevMessages[chatName] || []), { from: "me", text: messageText }]
    }));
  };

  return (
    <div className="chat-page">
      <Sidebar selectedChat={selectedChat} onSelectChat={setSelectedChat} />
      <ChatWindow
        selectedChat={selectedChat}
        messages={chatMessages[selectedChat] || []}
        onSendMessage={handleSendMessage}
      />
    </div>

  );
}