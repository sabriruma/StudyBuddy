import { Outlet, Link } from 'react-router-dom';
import './Root.css';
import ThemeToggle from './ComponentsMain/ThemeToggle';

export function Root() {
  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-left">
          <span className="logo">🔥 StudyBuddy</span>
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/matching" className="nav-link">Matching</Link>
          <Link to="/chat" className="nav-link">Chat</Link>
        </div>
        <ThemeToggle />
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}