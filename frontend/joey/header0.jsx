import { useState } from 'react';
import DarkModeToggle from './DarkModeToggle';

const subjects = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Engineering',
  'Business',
  'Economics',
  'Psychology',
  'History',
  'Literature',
  'Languages'
];

export default function Header({ onLoginClick, onSignupClick }) {
  const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-[#00bfa5]">StudyBuddy</span>
          </div>

          <nav className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
            <a
              href="#"
              className="border-[#00bfa5] text-gray-900 dark:text-gray-100 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
            >
              Home
            </a>

            {/* How It Works button triggers About Us modal */}
            <button
              onClick={() => setIsAboutOpen(true)}
              className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
            >
              About Us
            </button>

            {/* Subjects Dropdown */}
            <div className="relative h-full flex items-center">
              <button
                onClick={() => setIsSubjectsOpen(!isSubjectsOpen)}
                className={`${
                  isSubjectsOpen
                    ? 'border-[#00bfa5] text-gray-900 dark:text-gray-100'
                    : 'border-transparent text-gray-500'
                } hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full`}
              >
                Subjects
                <svg
                  className={`ml-1 h-4 w-4 transition-transform ${
                    isSubjectsOpen ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isSubjectsOpen && (
                <div className="absolute z-10 left-0 top-full mt-0 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1 grid grid-cols-2 gap-2 p-2">
                    {subjects.map((subject) => (
                      <a
                        key={subject}
                        href="#"
                        className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        {subject}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center space-x-4">
            <DarkModeToggle />
            <button
              onClick={onLoginClick}
              className="text-black-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300 px-3 py-2 rounded-md text-sm font-medium"
            >
              Log In
            </button>
            <button
              onClick={onSignupClick}
              className="bg-[#00bfa5] hover:bg-green-600 dark:bg-green-600 dark:hover:bg-[#00bfa5] text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* About Us Modal */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setIsAboutOpen(false)}
          ></div>

          {/* Modal panel */}
          <div className="relative z-10 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full transform transition-all duration-300 opacity-100 scale-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">About Us</h2>
              <button
                onClick={() => setIsAboutOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <strong>Team 8 StudyBuddy:</strong> Sabrina R., Joel M., Sean H., Rafael R.
            </p>
            <p className="flex items-center text-gray-700 dark:text-gray-300 mb-2">
              <img
                src="/FIU-Panthers-logo.png"
                alt="FIU Logo"
                className="h-12 w-auto mr-2"
              />
              <strong>Florida International University</strong>
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              This platform was built by students, for students.
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
