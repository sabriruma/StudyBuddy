import React, { useState, useEffect } from 'react';

const SettingsPage = () => {
  // Dark mode state
  const [theme, setTheme] = useState("light");
  
  // Other settings states
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    chat: true,
    calendar: true
  });
  
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showOnlineStatus: false,
    allowMessagesFromStrangers: false
  });
  
  const [preferences, setPreferences] = useState({
    language: 'english',
    soundEnabled: true,
    autoSave: true
  });

  const [saved, setSaved] = useState(false);

  // Icons
  const MoonIcon = () => (
    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );

  const SunIcon = () => (
    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );

  const BellIcon = () => (
    <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );

  const ShieldIcon = () => (
    <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );

  const UserIcon = () => (
    <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const PaletteIcon = () => (
    <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
    </svg>
  );

  const SaveIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  );

  const CheckIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );

  // Dark mode logic from your original component
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = storedTheme || (prefersDark ? "dark" : "light");

    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleNotificationChange = (key, value) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handlePrivacyChange = (key, value) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    // Here you would typically save to your backend/Firebase
    localStorage.setItem('userNotifications', JSON.stringify(notifications));
    localStorage.setItem('userPrivacy', JSON.stringify(privacy));
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{label}</h4>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
          enabled ? 'bg-teal-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  const SettingsSection = ({ icon, title, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
      </div>
      <div className="px-6 py-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and app settings</p>
        </div>

        <div className="space-y-6">
          {/* Appearance Settings */}
          <SettingsSection icon={<PaletteIcon />} title="Appearance">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Theme</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Choose between light and dark mode
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-12 w-20 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-teal-100'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-11 w-11 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out flex items-center justify-center ${
                      theme === 'dark' ? 'translate-x-8' : 'translate-x-0'
                    }`}
                  >
                    {theme === 'dark' ? (
                      <MoonIcon />
                    ) : (
                      <SunIcon />
                    )}
                  </span>
                </button>
              </div>
            </div>
          </SettingsSection>

          {/* Notification Settings */}
          <SettingsSection icon={<BellIcon />} title="Notifications">
            <div className="space-y-2">
              <ToggleSwitch
                enabled={notifications.email}
                onChange={(value) => handleNotificationChange('email', value)}
                label="Email Notifications"
                description="Receive updates via email"
              />
              <ToggleSwitch
                enabled={notifications.push}
                onChange={(value) => handleNotificationChange('push', value)}
                label="Push Notifications"
                description="Get notified on your device"
              />
              <ToggleSwitch
                enabled={notifications.chat}
                onChange={(value) => handleNotificationChange('chat', value)}
                label="Chat Messages"
                description="Notifications for new messages"
              />
              <ToggleSwitch
                enabled={notifications.calendar}
                onChange={(value) => handleNotificationChange('calendar', value)}
                label="Calendar Events"
                description="Reminders for upcoming events"
              />
            </div>
          </SettingsSection>

          {/* Privacy Settings */}
          <SettingsSection icon={<ShieldIcon />} title="Privacy & Security">
            <div className="space-y-2">
              <ToggleSwitch
                enabled={privacy.profileVisible}
                onChange={(value) => handlePrivacyChange('profileVisible', value)}
                label="Public Profile"
                description="Allow others to see your profile"
              />
              <ToggleSwitch
                enabled={privacy.showOnlineStatus}
                onChange={(value) => handlePrivacyChange('showOnlineStatus', value)}
                label="Show Online Status"
                description="Let others see when you're online"
              />
            </div>
          </SettingsSection>

          {/* General Preferences */}
          <SettingsSection icon={<UserIcon />} title="General Preferences">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Language</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Choose your preferred language</p>
                </div>
                <select
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="english">English</option>
                </select>
              </div>
            </div>
          </SettingsSection>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveSettings}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {saved ? (
                <>
                  <CheckIcon />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <SaveIcon />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;