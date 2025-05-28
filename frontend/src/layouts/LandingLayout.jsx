import { Outlet, Link, useNavigate } from 'react-router-dom';
import './LandingLayout.css';
import ThemeToggle from '../ComponentsMain/ThemeToggle';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/firebase';

export function LandingLayout() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const handleLoginClick = () => {
    navigate('/login'); // Navigate to login page
  };

  return (
    <div className="landing-layout">
      <nav className="landing-navbar">
      {user ? (
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

        <div className="nav-buttons">
          <button onClick={handleLoginClick} className="btn login-btn">Login</button>
          <Link to="/signup" className="btn signup-btn">Sign Up</Link>
          <ThemeToggle />
        </div>
      </nav>

      <main className="landing-main">
        <Outlet />
      </main>
    </div>
  );
}