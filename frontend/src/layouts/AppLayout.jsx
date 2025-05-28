import './AppLayout.css';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { Outlet, Link } from 'react-router-dom';
import ThemeToggle from '../ComponentsMain/ThemeToggle';

export function AppLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-left">
        {isLoggedIn ? (
  <div className="brand-link">
    <img src="/logo.png" alt="StudyBuddy Logo" className="logo-img" />
    <span className="brand-name">StudyBuddy</span>
  </div>
) : (
  <Link to="/" className="brand-link">
    <img src="/logo.png" alt="StudyBuddy Logo" className="logo-img" />
    <span className="brand-name">StudyBuddy</span>
  </Link>
)}

          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/matching" className="nav-link">Matching</Link>
              <Link to="/chat" className="nav-link">Chat</Link>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/matching" className="nav-link">Matching</Link>
              <Link to="/chat" className="nav-link">Chat</Link>
            </>
          )}
        </div>
        <ThemeToggle />
      </nav>
    
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}