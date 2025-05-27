import { Outlet, Link } from 'react-router-dom';
import './AppLayout.css';
import ThemeToggle from '../ComponentsMain/ThemeToggle';

export function AppLayout() {
  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-left">
        <Link to="/" className="brand-link">
            <img src="/logo.png" alt="StudyBuddy Logo" className="logo-img" />
            <span className="brand-name">StudyBuddy</span>
          </Link>
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