import { Outlet, Link, useNavigate } from 'react-router-dom';
import './LandingLayout.css';
import ThemeToggle from '../ComponentsMain/ThemeToggle';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/firebase';
import Header from "../components/Header"
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';
import { useState } from 'react';
import HomePage from '../pages/Home/HomePage';

export function LandingLayout() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const handleLoginClick = () => {
    navigate('/login'); // Navigate to login page
  };

  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)

  const handleSwitchToggle = () => {
    setIsLoginOpen(!isLoginOpen)
    setIsSignUpOpen(!isSignUpOpen)
  }

  const onCreateAccountSuccess = () => {
    navigate('/create-profile-step1')
  }
  return (
    <div className="landing-layout">
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSwitchToSignup={handleSwitchToggle}/>
      <SignupModal isOpen={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} onSwitchToLogin={handleSwitchToggle} onSignupSuccess={onCreateAccountSuccess}/>
      <Header 
      onLoginClick={() => setIsLoginOpen(true)} 
      onSignUpClick={() => setIsSignUpOpen(true)}
      />
      <main className="landing-main">
        <HomePage openSignUp={() => setIsSignUpOpen(true)}/>
      </main>
    </div>
  );
}