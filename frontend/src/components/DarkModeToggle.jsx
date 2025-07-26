import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const setMode = stored !== null ? stored : prefersDark ? "dark" : "light"
    console.log("setMode:", setMode)
    setDarkMode(setMode === "dark");
    document.documentElement.setAttribute('data-theme', setMode);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(true)
    localStorage.setItem('darkMode', "dark");
    document.documentElement.setAttribute('data-theme', 'dark');
  };

  const toggleLightMode = () => {
    setDarkMode(false)
    localStorage.setItem('darkMode', "light");
    document.documentElement.setAttribute('data-theme', 'light');
  }

  return (
    <>
      {darkMode ? (
        <button
      onClick={toggleLightMode}
      className="p-2 rounded-full focus:outline-none"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        </button>
      ) : (
        <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full focus:outline-none"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
    </button>

      )}
      </>
  );
  
}
