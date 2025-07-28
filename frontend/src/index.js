import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home/HomePage";
import Matching from "./pages/Matching/Matching";
import { NotFound } from "./pages/NotFound/NotFound";
import Dashboard from "./pages/Dashboard/Dashboard";
import { ThemeProvider } from "./ThemeContext";
import { AppLayout } from "./layouts/AppLayout";
import { LandingLayout } from "./layouts/LandingLayout";
import Login from "./pages/Login/Login"; // your login page component
import Signup from "./pages/Signup/Signup"; // if you have this page
import CreateProfileStep1 from "./pages/ProfileCreation/CreateProfileStep1";
import CreateProfileStep2 from "./pages/ProfileCreation/CreateProfileStep2";
import CreateProfileStep3 from "./pages/ProfileCreation/CreateProfileStep3";
import StudyBuddyDashboard from "./components/Dashboard";
import ProfileEditor from "./pages/ProfileEdit/ProfileEditor";
import "./index.css";
import Chat from "./components/Chat";
import CalendarPage from "./pages/Calendar/CalendarPage";

import AITutor from "./pages/AITutor/AITutor";
import SettingsPage from "./pages/Settings/Settings";
import QuizGenerator from "./pages/Quiz/QuizGenerator";

//Different tabs
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
        <Route path="/create-profile-step1" element={<CreateProfileStep1 />} />
        <Route path="/create-profile-step2" element={<CreateProfileStep2 />} />
        <Route path="/create-profile-step3" element={<CreateProfileStep3 />} />
        <Route path="/" element={<AppLayout />}>
          <Route path="/matching" element={<Matching />} />
          <Route path="chat" element={<Chat />} />
          <Route path="/dashboard" element={<StudyBuddyDashboard />} />
          <Route path="/old-dashboard" element={<Dashboard />} />
          <Route path="/ai" element={<AITutor />} />
          <Route path="/quiz" element={<QuizGenerator />} />
          <Route path="/profile" element={<ProfileEditor />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
