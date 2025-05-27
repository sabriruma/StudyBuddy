import { Link } from 'react-router-dom';
import './LandingLayout.css';

export function LandingLayout() {
  return (
    <div className="landing-container">
      <nav className="landing-navbar">
        <div className="landing-brand">
          <img src="/logo.png" alt="StudyBuddy Logo" className="landing-logo" />
          <span className="landing-title">StudyBuddy</span>
        </div>
        <Link to="/chat" className="landing-nav-button">Enter App</Link>
      </nav>

      <header className="landing-hero">
        <h1>Welcome to StudyBuddy 🎓</h1>
        <p>Find your perfect study group and ace your exams together.</p>
        <Link to="/matching" className="cta-button">Get Started</Link>
      </header>
    </div>
  );
}