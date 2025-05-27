import { Outlet, Link } from 'react-router-dom';
import './LandingLayout.css';  // your landing-specific styles here
import ThemeToggle from '../ComponentsMain/ThemeToggle';

export function LandingLayout() {
  return (
    <div className="landing-layout">
      <nav className="landing-navbar">
        <Link to="/" className="brand-link">
          <img src="/logo.png" alt="StudyBuddy Logo" className="logo-img" />
          <span className="brand-name">StudyBuddy</span>
        </Link>
        <ThemeToggle />
      </nav>
      <main className="landing-main">
        <Outlet />
      </main>
    </div>
  );
}