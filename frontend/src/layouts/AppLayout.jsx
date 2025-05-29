import './AppLayout.css';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../ComponentsMain/ThemeToggle';


export function AppLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Redirect to home after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

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
        <div className="nav-right">
        <div className="nav-buttons">
  {isLoggedIn && (
    <button onClick={handleLogout} className="btn logout-btn">
      Logout
    </button>
  )}
  <ThemeToggle />
</div>
</div>
      </nav>
    
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}