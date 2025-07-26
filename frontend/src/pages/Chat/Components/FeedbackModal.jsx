import React, { useState } from 'react';
import '../Styles/FeedbackModal.css';

export default function FeedbackModal({ 
  isOpen, 
  onClose, 
  partnerName, 
  onSubmitFeedback, 
  isLoading 
}) {
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = () => {
    if (feedback !== null) {
      onSubmitFeedback(feedback);
      setFeedback(null);
    }
  };

  const handleClose = () => {
    setFeedback(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="feedback-popup">
      <div className="feedback-popup-content">
        <button className="close-btn" onClick={handleClose}>×</button>
        
        <p>How is it going with <strong>{partnerName}</strong>?</p>
        
        <div className="feedback-buttons">
          <button
            className={`feedback-btn thumbs-down ${feedback === false ? 'selected' : ''}`}
            onClick={() => setFeedback(false)}
            disabled={isLoading}
          >
            👎
            <span>Not Great</span>
          </button>
          
          <button
            className={`feedback-btn thumbs-up ${feedback === true ? 'selected' : ''}`}
            onClick={() => setFeedback(true)}
            disabled={isLoading}
          >
            👍
            <span>Great!</span>
          </button>
        </div>
        
        <button 
          className="submit-btn"
          onClick={handleSubmit}
          disabled={feedback === null || isLoading}
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
} 