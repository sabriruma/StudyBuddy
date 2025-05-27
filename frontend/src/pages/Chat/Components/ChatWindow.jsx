import React from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import "../Styles/ChatWindow.css";

export default function ChatWindow({ selectedChat }) {
  return (
    <div className="chat-window">
      <ChatHeader selectedChat={selectedChat} />
      <MessageList selectedChat={selectedChat} />
      <MessageInput selectedChat={selectedChat} />
    </div>
  );
}