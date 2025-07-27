// push this in components so we can reuse it and making it easier for routing


import { NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { signOut } from 'firebase/auth';
import {
  HomeIcon, UserPlusIcon, AcademicCapIcon,
  ChatBubbleLeftRightIcon, UserIcon, Cog6ToothIcon,
  ArrowLeftStartOnRectangleIcon, CalendarIcon,
  PuzzlePieceIcon
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Redirect to landing page
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="w-50 bg-gray-900 border-r border-gray-500 py-5 flex flex-col h-screen sticky top-0">
      <div className="text-2xl font-bold text-teal-400 px-5 pb-5">StudyBuddy</div>

      <div className="px-3 flex-1 flex flex-col space-y-1">
        <div className="space-y-1">
          <NavItem to="/dashboard" icon={<HomeIcon className="h-5 w-5" />} text="HOME" />
          <NavItem to="/matching" icon={<UserPlusIcon className="h-5 w-5" />} text="MATCHING" />
          <NavItem to="/chat" icon={<ChatBubbleLeftRightIcon className="h-5 w-5" />} text="CHAT" />
          <NavItem to="/ai" icon={<AcademicCapIcon className="h-5 w-5" />} text="AI TUTOR" />
          <NavItem to="/quiz" icon={<PuzzlePieceIcon className="h-5 w-5" />} text="QUIZ GENERATOR" />
          <NavItem to="/calendar" icon={<CalendarIcon className="h-5 w-5" />} text="CALENDAR" />
          <NavItem to="/profile" icon={<UserIcon className="h-5 w-5" />} text="PROFILE" />
          <NavItem to="/settings" icon={<Cog6ToothIcon className="h-5 w-5" />} text="SETTINGS" />
        </div>

        <div className="mt-auto pt-4 border-t border-gray-500">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-800 hover:text-rose-200 transition-colors"
          >
            <ArrowLeftStartOnRectangleIcon className="h-5 w-5 mr-3" />
            LOGOUT
          </button>
        </div>
      </div>
    </div>
  );
}

function NavItem({ to, icon, text }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
          isActive
            ? 'bg-gray-800 text-teal-400 border-l-4 border-teal-400'
            : 'text-gray-300 hover:bg-gray-800 hover:text-cyan-200'
        }`
      }
    >
      <span className="mr-3">{icon}</span>
      {text}
    </NavLink>
  );
}