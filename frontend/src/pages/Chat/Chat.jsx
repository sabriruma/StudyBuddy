import React, { useState } from "react";
import Sidebar from "./Components/Sidebar";
import ChatWindow from "./Components/ChatWindow";
import "./Chat.css";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState("Alice");

  return (
    <div className="chat-page">
      <Sidebar selectedChat={selectedChat} onSelectChat={setSelectedChat} />
      <ChatWindow selectedChat={selectedChat} />
    </div>
  );
}