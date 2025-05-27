import React from 'react';
import './Home.css';

export function Home() {
  return (
    <div className="landing-container">
      <div className="hero">
        <h1>Welcome to StudyBuddy 📚</h1>
        <p>Find your perfect study group based on your courses, habits, and goals.</p>
        <a href="/matching" className="cta-button">Get Started</a>
      </div>
    </div>
  );
}