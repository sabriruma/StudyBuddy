import { Outlet, Link, useNavigate } from 'react-router-dom';
import './LandingLayout.css';
import ThemeToggle from '../ComponentsMain/ThemeToggle';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/firebase';
import Header from "../components/Header"
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';
import { useState, useEffect } from 'react';
import HomePage from '../pages/Home/HomePage';
import CreateProfileStep1 from '../pages/ProfileCreation/CreateProfileStep1';
import CreateProfileStep2 from '../pages/ProfileCreation/CreateProfileStep2';
import CreateProfileStep3 from '../pages/ProfileCreation/CreateProfileStep3';

import ModalWrapper from '../components/ModalWrapper';

export function LandingLayout() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const handleLoginClick = () => {
    navigate('/login'); // Navigate to login page
  };

  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const [createAccountModalStep, setCreateAccountModalStep] = useState(0)

  const handleSwitchToggle = () => {
    setIsLoginOpen(!isLoginOpen)
    setIsSignUpOpen(!isSignUpOpen)
  }

  const onCreateAccountSuccess = () => {
    setCreateAccountModalStep(1)
  }

  const handleGoNextStep = () => {
    if(createAccountModalStep < 3){
      setCreateAccountModalStep(createAccountModalStep + 1)
    }
  }

  const handleGoBackStep = () => {
    if(createAccountModalStep > 1){
      setCreateAccountModalStep(createAccountModalStep - 1)
    }
  }

  const handleResetSteps = () => {
    setCreateAccountModalStep(0)
  }
  
  console.log("createAccountModalStep:", createAccountModalStep)
  return (
    <div className="landing-layout">
      <RenderCreateAccountModalSteps step={createAccountModalStep} handleGoNextStep={handleGoNextStep} handleGoBackStep={handleGoBackStep} handleResetSteps={handleResetSteps}/>
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

const RenderCreateAccountModalSteps = ({step, handleGoNextStep, handleGoBackStep, handleResetSteps}) => {
  switch(step){
    case 1:
      return(
      <ModalWrapper closeModal={handleResetSteps}>
        <CreateProfileStep1 handleGoNextStep={handleGoNextStep}/>
      </ModalWrapper>
      )
    case 2:
      return(
        <ModalWrapper closeModal={handleResetSteps}>
        <CreateProfileStep2 handleGoNextStep={handleGoNextStep} handleGoBackStep={handleGoBackStep}/>
      </ModalWrapper>
      )
    case 3:
      return(
        <ModalWrapper closeModal={handleResetSteps}>
        <CreateProfileStep3 handleGoNextStep={handleGoNextStep} handleGoBackStep={handleGoBackStep} handleResetSteps={handleResetSteps}/>
      </ModalWrapper>
      )
  }

}