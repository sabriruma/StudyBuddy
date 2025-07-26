import React, { useState } from "react";
import "../Styles/ChatWindow.css";
import ChatHeader from "./ChatHeader";
import FeedbackModal from "./FeedbackModal";
import { useEffect, useRef } from "react";

export default function ChatWindow({ selectedChat, chatDisplayName, messages, onSendMessage, currentUserId }) {
  const [newMessage, setNewMessage] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(selectedChat, newMessage);
    setNewMessage("");
  };

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check feedback eligibility when messages change
  useEffect(() => {
    if (!currentUserId || !selectedChat || messages.length === 0) return;

    const checkFeedbackEligibility = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}api/checkFeedbackEligibility/${currentUserId}/${selectedChat}`
        );
        const data = await response.json();
        
        if (data.eligible) {
          setShowFeedbackModal(true);
        }
      } catch (error) {
        console.error('Error checking feedback eligibility:', error);
      }
    };

    // Check eligibility after a short delay to ensure messages are updated
    const timeoutId = setTimeout(checkFeedbackEligibility, 1000);
    return () => clearTimeout(timeoutId);
  }, [messages, currentUserId, selectedChat]);

  const handleSubmitFeedback = async (positiveFeedback) => {
    setIsSubmittingFeedback(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}api/submitFeedback/${currentUserId}/${selectedChat}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ positiveFeedback })
        }
      );
      
      if (response.ok) {
        setShowFeedbackModal(false);
        // Could show a success message here
      } else {
        console.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  console.log("messages:", messages)
  //test
  return (
    <div className="chat-window">
  <div className="chat-window-inner">
    <ChatHeader selectedChat={`${chatDisplayName}`} />

    <div className="chat-messages">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`chat-bubble ${msg.senderId === selectedChat ? "incoming" : "outgoing"}`}
        >
          {msg.text}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>

    <div className="chat-input">
      <input
        type="text"
        value={newMessage}
        placeholder="Type a message..."
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  </div>

  <FeedbackModal
    isOpen={showFeedbackModal}
    onClose={() => setShowFeedbackModal(false)}
    partnerName={chatDisplayName}
    onSubmitFeedback={handleSubmitFeedback}
    isLoading={isSubmittingFeedback}
  />
</div>

  );
}
