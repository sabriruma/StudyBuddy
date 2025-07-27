import "./AppLayout.css";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { Outlet, Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../ComponentsMain/ThemeToggle";
import Sidebar from "../components/Sidebar";

export function AppLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Redirect to home after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="layout flex">
      <Sidebar />

      <main className="main-content dark:bg-gray-900">
        <Outlet />
      </main>
    </div>
  );
}
