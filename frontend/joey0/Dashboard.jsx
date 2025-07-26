// not finished

import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import Sidebar from '../../components/Sidebar';
import { db, auth } from '../../firebase/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FiTrendingUp, FiZap, FiSmile, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const events = [
  { date: new Date(2023, 5, 15), title: 'Group Study Session' },
  { date: new Date(2023, 5, 18), title: 'AI Tutor Meeting' },
  { date: new Date(2023, 5, 22), title: 'Project Deadline' },
];

const widgetData = [
  {
    title: 'Progress Tracker',
    icon: <FiTrendingUp className="text-white" size={20} />,
    content: (
      <>
        <p className="mb-4 opacity-90">You've completed 80% of your Data Structures course!</p>
        <div className="w-full bg-green-300 bg-opacity-30 rounded-full h-2.5 mb-2">
          <div className="bg-white h-2.5 rounded-full" style={{ width: '80%' }}></div>
        </div>
        <div className="flex justify-between text-sm">
          <span>Weekly Progress</span>
          <span>Top 15% of students</span>
        </div>
      </>
    ),
    bg: 'from-teal-500 to-slate-900',
  },
  {
    title: 'AI Tutor Tip',
    icon: <FiZap className="text-white" size={20} />,
    content: (
      <>
        <p className="opacity-90 mb-2">"Stuck on a problem? Ask your AI Tutor to explain it step-by-step!"</p>
        <p className="text-sm opacity-80">Tip: Use specific questions like "Why is this formula used here?"</p>
      </>
    ),
    bg: 'from-purple-500 to-pink-400',
  },
  {
    title: 'Motivational Boost',
    icon: <FiSmile className="text-white" size={20} />,
    content: (
      <>
        <p className="opacity-90 mb-2">"Success is the sum of small efforts, repeated day in and day out."</p>
        <p className="text-sm opacity-80">– Robert Collier</p>
      </>
    ),
    bg: 'from-amber-500 to-yellow-300',
  },
];

const StudyBuddyDashboard = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [groupChats, setGroupChats] = useState([]);
  const [individualChats, setIndividualChats] = useState([]);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentWidgetIndex, setCurrentWidgetIndex] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();

  const handleNextWidget = () => {
    setCurrentWidgetIndex((prevIndex) => 
      prevIndex === widgetData.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevWidget = () => {
    setCurrentWidgetIndex((prevIndex) => 
      prevIndex === 0 ? widgetData.length - 1 : prevIndex - 1
    );
  };

  const searchOptions = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Matching', route: '/matching' },
    { label: 'Chat', route: '/chat' },
    { label: 'AI Tutor', route: '/ai' },
    { label: 'Calendar', route: '/calendar' },
    { label: 'Profile', route: '/profile' },
  ];

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query) {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const matches = searchOptions.filter(option =>
      option.label.toLowerCase().includes(query)
    );
    setFilteredSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  };

  const handleSelect = (route) => {
    navigate(route);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const currentUserId = user.uid;
      setCurrentUserId(currentUserId);

      try {
        const groupQuery = query(
          collection(db, 'groups'),
          where('members', 'array-contains', currentUserId)
        );
        const groupSnap = await getDocs(groupQuery);
        const groups = groupSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

        const enrichedGroups = await Promise.all(groups.map(async group => {
          const messagesRef = collection(db, 'groups', group.id, 'messages');
          const latestQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
          const latestSnap = await getDocs(latestQuery);
          const lastMessage = latestSnap.docs[0]?.data();

          return { ...group, lastMessage, unreadCount: 0 };
        }));
        setGroupChats(enrichedGroups);

        const chatSnap = await getDocs(collection(db, 'chats'));
        const userChats = chatSnap.docs.filter(docSnap => {
          const chatId = docSnap.id;
          const participants = chatId.split('_');
          return participants.includes(currentUserId);
        });

        const enrichedChats = await Promise.all(userChats.map(async (docSnap) => {
          const chatId = docSnap.id;
          const messagesRef = collection(db, 'chats', chatId, 'messages');
          const latestQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
          const latestSnap = await getDocs(latestQuery);
          const lastMessage = latestSnap.docs[0]?.data();

          if (!lastMessage || !lastMessage.from || !lastMessage.to) return null;

          const otherUserId = lastMessage.from === currentUserId ? lastMessage.to : lastMessage.from;
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          const userData = userDoc.exists() ? userDoc.data() : {};

          return {
            chatId,
            otherUserId,
            displayName: `${userData.firstName || 'Unknown'} ${userData.lastName || ''}`.trim(),
            avatar: userData.avatar || '/defaultAvatar.png',
            lastMessage,
            unreadCount: 0,
          };
        }));

        setIndividualChats(enrichedChats.filter(Boolean));

        const matchesSnap = await getDocs(collection(db, 'users', currentUserId, 'matches'));
        const recommended = await Promise.all(matchesSnap.docs.map(async (matchDoc) => {
          const matchData = matchDoc.data();
          const profileDoc = await getDoc(doc(db, 'users', matchData.userId));
          const profile = profileDoc.exists() ? profileDoc.data() : {};

          return {
            userId: matchData.userId,
            avatar: profile.avatar || '/SBmascot.png',
            fullName: `${profile.firstName || 'Unknown'} ${profile.lastName || ''}`,
            mutualScore: matchData.mutualScore || 0
          };
        }));

        setPotentialMatches(recommended);
        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 relative">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome back, Sean!</h2>
            <p className="text-gray-500">Here's your study overview for today</p>
          </div>

          <div className="relative w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search (e.g., chat, matching, AI)"
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full"
            />
            {showSuggestions && (
              <ul className="absolute top-11 left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
                {filteredSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelect(suggestion.route)}
                    className="px-4 py-2 hover:bg-indigo-100 cursor-pointer text-gray-800"
                  >
                    {suggestion.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Single Widget with Navigation */}
        <div className={`bg-gradient-to-r ${widgetData[currentWidgetIndex].bg} rounded-xl p-6 text-white mb-6 relative`}>
          <div className="flex items-center justify-between mb-3">
            <button 
              onClick={handlePrevWidget}
              className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition"
            >
              <FiChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              {widgetData[currentWidgetIndex].icon}
              <h3 className="text-lg font-semibold">{widgetData[currentWidgetIndex].title}</h3>
            </div>
            <button 
              onClick={handleNextWidget}
              className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
          {widgetData[currentWidgetIndex].content}
          <div className="flex justify-center mt-4 space-x-2">
            {widgetData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentWidgetIndex(index)}
                className={`w-2 h-2 rounded-full ${currentWidgetIndex === index ? 'bg-white' : 'bg-white bg-opacity-30'}`}
              />
            ))}
          </div>
        </div>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Chats */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Chats & Study Groups</h3>
            {(groupChats.length > 0 || individualChats.length > 0) ? (
              <div className="space-y-2">
                {groupChats.map(group => (
                  <div key={group.id} className="text-sm">
                    <p className="font-medium">{group.name}</p>
                    <p className="text-gray-600">{group.lastMessage?.text || 'No messages yet.'}</p>
                  </div>
                ))}
                {individualChats.map(chat => (
                  <div key={chat.chatId} className="text-sm">
                    <p className="font-medium">{chat.displayName}</p>
                    <p className="text-gray-600">{chat.lastMessage.text || 'Say hello!'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No chats yet. <Link to="/matching" className="text-indigo-600">Start matching</Link></p>
            )}
          </div>

          {/* Matches */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Recommended Matches</h3>
            {potentialMatches.length > 0 ? (
              <div className="space-y-2">
                {potentialMatches.map((match, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <img src={match.avatar} className="w-8 h-8 rounded-full" alt="avatar" />
                    <div>
                      <p className="font-medium text-sm">{match.fullName}</p>
                      <p className="text-xs text-gray-500">Mutual Score: {match.mutualScore}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No matches yet. <Link to="/matching" className="text-indigo-600">Run the algorithm</Link></p>
            )}
          </div>

          {/* Calendar */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Upcoming Sessions</h3>
            <Calendar
              onChange={() => {}}
              value={new Date()}
              tileClassName={({ date }) => {
                try {
                  const dateStr = date?.toISOString?.().split("T")[0];
                  const highlightDates = ['2025-06-01', '2025-06-04', '2025-06-10'];
                  return highlightDates.includes(dateStr) ? "highlight" : null;
                } catch {
                  return null;
                }
              }}
            />
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Upcoming Events</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {events.map((event, index) => (
                  <li key={index}>
                    <span className="font-medium">{event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>: {event.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Notification Bar */}
          <div className="bg-white p-6 rounded-xl shadow-sm col-span-1 md:col-span-2 lg:col-span-3">
            <h3 className="text-lg font-semibold mb-2">Notifications</h3>
            <p className="text-sm text-gray-600">No new notifications</p>
          </div>
          {/* Call-to-Action Buttons */}
          <div className="bg-white p-6 rounded-xl shadow-sm col-span-1 md:col-span-2 lg:col-span-3">
            <h3 className="text-lg font-semibold mb-2">Start Study Session</h3>
            <p className="text-sm text-gray-600">No new notifications</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm col-span-1 md:col-span-2 lg:col-span-3">
            <h3 className="text-lg font-semibold mb-2">Ask AI Tutor</h3>
            <p className="text-sm text-gray-600">No new notifications</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm col-span-1 md:col-span-2 lg:col-span-3">
            <h3 className="text-lg font-semibold mb-2">Upload Resource</h3>
            <p className="text-sm text-gray-600">No new notifications</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyBuddyDashboard;