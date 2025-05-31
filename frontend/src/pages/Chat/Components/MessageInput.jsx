import React, { useState } from "react";
import "../Styles/MessageInput.css";

export default function MessageInput({ selectedChat, onSendMessage }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(selectedChat, text);
      setText("");
    }
  };

  return (
    <div className="message-input">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Message ${selectedChat}...`}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
