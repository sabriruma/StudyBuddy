// not finished

import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import Sidebar from "./Sidebar";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  FiTrendingUp,
  FiZap,
  FiSmile,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import ChatAndGroupComponent from "../pages/Dashboard/ChatAndGroupComponent";

const events = [
  { date: new Date(2023, 5, 15), title: "Group Study Session" },
  { date: new Date(2023, 5, 18), title: "AI Tutor Meeting" },
  { date: new Date(2023, 5, 22), title: "Project Deadline" },
];

const widgetData = [
  {
    title: "Progress Tracker",
    icon: <FiTrendingUp className="text-white" size={20} />,
    content: (
      <>
        <p className="mb-4 opacity-90">
          You've completed 80% of your Data Structures course!
        </p>
        <div className="w-full bg-green-300 bg-opacity-30 rounded-full h-2.5 mb-2">
          <div
            className="bg-white h-2.5 rounded-full"
            style={{ width: "80%" }}
          ></div>
        </div>
        <div className="flex justify-between text-sm">
          <span>Weekly Progress</span>
          <span>Top 15% of students</span>
        </div>
      </>
    ),
    bg: "from-primary-500 to-slate-900",
  },
  {
    title: "AI Tutor Tip",
    icon: <FiZap className="text-white" size={20} />,
    content: (
      <>
        <p className="opacity-90 mb-2">
          "Stuck on a problem? Ask your AI Tutor to explain it step-by-step!"
        </p>
        <p className="text-sm opacity-80">
          Tip: Use specific questions like "Why is this formula used here?"
        </p>
      </>
    ),
    bg: "from-purple-500 to-pink-400",
  },
  {
    title: "Motivational Boost",
    icon: <FiSmile className="text-white" size={20} />,
    content: (
      <>
        <p className="opacity-90 mb-2">
          "Success is the sum of small efforts, repeated day in and day out."
        </p>
        <p className="text-sm opacity-80">– Robert Collier</p>
      </>
    ),
    bg: "from-amber-500 to-yellow-300",
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
  const [currentUserFirstName, setCurrentUserFirstName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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
    { label: "Dashboard", route: "/dashboard" },
    { label: "Matching", route: "/matching" },
    { label: "Chat", route: "/chat" },
    { label: "AI Tutor", route: "/ai" },
    { label: "Calendar", route: "/calendar" },
    { label: "Profile", route: "/profile" },
  ];

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query) {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const matches = searchOptions.filter((option) =>
      option.label.toLowerCase().includes(query)
    );
    setFilteredSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  };

  const handleSelect = (route) => {
    navigate(route);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const currentUserId = user.uid;
      setCurrentUserId(currentUserId);

      try {
        // Get the current user's full document
        const userDocRef = doc(db, "users", currentUserId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setCurrentUserFirstName(userData.firstName || "");
        }

        // === GROUP CHATS ===
        const groupQuery = query(
          collection(db, "groups"),
          where("members", "array-contains", currentUserId)
        );
        const groupSnap = await getDocs(groupQuery);

        const groups = groupSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        const enrichedGroups = await Promise.all(
          groups.map(async (group) => {
            const messagesRef = collection(db, "groups", group.id, "messages");
            const latestQuery = query(
              messagesRef,
              orderBy("timestamp", "desc"),
              limit(1)
            );
            const latestSnap = await getDocs(latestQuery);
            const lastMessage = latestSnap.docs[0]?.data();

            return {
              ...group,
              lastMessage,
              unreadCount: 0,
            };
          })
        );

        setGroupChats(enrichedGroups);

        // === INDIVIDUAL CHATS ===
        const chatQuery = query(
          collection(db, "chats"),
          where("members", "array-contains", currentUserId)
        );
        const chatSnap = await getDocs(chatQuery);

        const chats = chatSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        const enrichedChats = await Promise.all(
          chats.map(async (chat) => {
            const chatId = chat.id;

            const messagesRef = collection(db, "chats", chatId, "messages");
            const latestQuery = query(
              messagesRef,
              orderBy("timestamp", "desc"),
              limit(1)
            );
            const latestSnap = await getDocs(latestQuery);
            const lastMessageDoc = latestSnap.docs[0];

            if (!lastMessageDoc) return null;

            const lastMessage = lastMessageDoc.data();

            const otherUserId = chat.members.find((id) => id !== currentUserId);
            if (!otherUserId) return null;

            const userDoc = await getDoc(doc(db, "users", otherUserId));
            const userData = userDoc.exists() ? userDoc.data() : {};

            return {
              chatId,
              otherUserId,
              displayName: `${userData.firstName || "Unknown"} ${
                userData.lastName || ""
              }`.trim(),
              avatar: userData.avatar || "/defaultAvatar.png",
              lastMessage,
            };
          })
        );
        setIndividualChats(enrichedChats.filter(Boolean));

        // === POTENTIAL MATCHES ===
        const matchesRef = collection(db, "users", currentUserId, "matches");
        const confirmedRef = collection(
          db,
          "users",
          currentUserId,
          "confirmedMatches"
        );

        const [matchesSnap, confirmedSnap] = await Promise.all([
          getDocs(matchesRef),
          getDocs(confirmedRef),
        ]);

        const confirmedIds = new Set(confirmedSnap.docs.map((doc) => doc.id));

        const recommended = await Promise.all(
          matchesSnap.docs
            .filter((matchDoc) => !confirmedIds.has(matchDoc.id))
            .map(async (matchDoc) => {
              const matchData = matchDoc.data();
              const profileDoc = await getDoc(
                doc(db, "users", matchData.userId)
              );
              const profile = profileDoc.exists() ? profileDoc.data() : {};

              return {
                userId: matchData.userId,
                avatar: profile.avatar || "/SBmascot.png",
                fullName: `${profile.firstName || "Unknown"} ${
                  profile.lastName || ""
                }`,
                mutualScore: matchData.mutualScore || 0,
              };
            })
        );

        setPotentialMatches(recommended);
        setLoading(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const [combinedGroupsAndChats, setCombinedGroupsAndChats] = useState([]);
  console.log(combinedGroupsAndChats);

  useEffect(() => {
    if (!groupChats && !individualChats) return;

    const combined = [...groupChats, ...individualChats];

    combined.sort((a, b) => {
      const aTimestamp = a.lastMessage?.timestamp?.seconds ?? 0;
      const bTimestamp = b.lastMessage?.timestamp?.seconds ?? 0;

      if (aTimestamp === bTimestamp) {
        const aNanos = a.lastMessage?.timestamp?.nanoseconds ?? 0;
        const bNanos = b.lastMessage?.timestamp?.nanoseconds ?? 0;
        return aNanos - bNanos;
      }

      return bTimestamp - aTimestamp;
    });

    setCombinedGroupsAndChats(combined);
  }, [groupChats, individualChats]);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 relative">
        <div>
          <h2 className="text-2xl font-bold ">
            Welcome back, {currentUserFirstName}!
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Here's your study overview for today
          </p>
        </div>

        <div className="relative w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search (e.g., chat, matching, AI)"
            className="!border-2 !border-red-500 !bg-gray-200/50 dark:!bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:placeholder-white dark:placeholder-neutral-200"
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
      <div
        className={`bg-gradient-to-r ${widgetData[currentWidgetIndex].bg} rounded-xl p-6 text-white mb-6 relative`}
      >
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handlePrevWidget}
            className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition"
          >
            <FiChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            {widgetData[currentWidgetIndex].icon}
            <h3 className="text-lg font-semibold">
              {widgetData[currentWidgetIndex].title}
            </h3>
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
              className={`w-2 h-2 rounded-full ${
                currentWidgetIndex === index
                  ? "bg-white"
                  : "bg-white bg-opacity-30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Dashboard Sections */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-6 flex-wrap">
          {/* Chats */}
          <InfoBox className={"max-h-[520px] h-[520px] flex-1 min-w-[350px]"}>
            <h3 className="text-lg font-semibold mb-2">Chats & Study Groups</h3>
            {groupChats.length > 0 || individualChats.length > 0 ? (
              <div className="flex flex-col overflow-y-auto gap-3 px-2 flex-1">
                {combinedGroupsAndChats.map((item) => {
                  return (
                    <ChatAndGroupComponent
                      item={item}
                      currentUserId={currentUserId}
                    />
                  );
                })}
              </div>
            ) : (
              <p>
                No chats or groups yet.{" "}
                <Link to="/matching" className="text-primary-500">
                  Start matching now!
                </Link>
              </p>
            )}
            <CTANavButton text={"Go to Chats"} link={"/chat"} />
          </InfoBox>

          {/* Matches */}
          <InfoBox className={"max-h-[520px] h-[520px] flex-1 min-w-[350px]"}>
            <h3 className="text-lg font-semibold mb-2">Recommended Matches</h3>
            {potentialMatches.length > 0 ? (
              <div className="flex flex-col gap-2 overflow-y-auto">
                {potentialMatches.map((match, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 border border-black/20 dark:border-white/20 dark:bg-gray-800 dark:border-gray-900 rounded-lg p-2"
                  >
                    <img
                      src={match.avatar}
                      className="w-8 h-8 rounded-full"
                      alt="avatar"
                    />
                    <div>
                      <p className="font-medium text-sm">{match.fullName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Mutual Score: {match.mutualScore}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No matches yet.{" "}
                <Link to="/matching" className="text-primary-500">
                  Run the algorithm
                </Link>
              </p>
            )}
            <CTANavButton text={"Find More Matches"} link={"/matching"} />
          </InfoBox>

          {/* Calendar */}
          <InfoBox className={"max-h-[520px] h-[520px] flex-1 min-w-[350px]"}>
            <h3 className="text-lg font-semibold mb-2">Upcoming Sessions</h3>
            <div className="overflow-y-auto">
              <Calendar
                className={"bg-gray-800"}
                onChange={() => {}}
                value={new Date()}
                tileClassName={({ date }) => {
                  try {
                    const dateStr = date?.toISOString?.().split("T")[0];
                    const highlightDates = [
                      "2025-06-01",
                      "2025-06-04",
                      "2025-06-10",
                    ];
                    return highlightDates.includes(dateStr)
                      ? "highlight"
                      : null;
                  } catch {
                    return null;
                  }
                }}
              />
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2">
                  Upcoming Events
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {events.map((event, index) => (
                    <li key={index}>
                      <span className="font-medium">
                        {event.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      : {event.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <CTANavButton text={"View Calendar"} link={"/calendar"} />
          </InfoBox>
        </div>
        {/* Notification Bar */}
        <InfoBox className="col-span-1 md:col-span-2 lg:col-span-3">
          <h3 className="text-lg font-semibold mb-2">Notifications</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No new notifications
          </p>
        </InfoBox>
        {/* Call-to-Action Buttons */}
        <InfoBox className="col-span-1 md:col-span-2 lg:col-span-3">
          <h3 className="text-lg font-semibold mb-2">Start Study Session</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No new notifications
          </p>
        </InfoBox>

        <InfoBox className="col-span-1 md:col-span-2 lg:col-span-3">
          <h3 className="text-lg font-semibold mb-2">Ask AI Tutor</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No new notifications
          </p>
        </InfoBox>

        <InfoBox className="col-span-1 md:col-span-2 lg:col-span-3">
          <h3 className="text-lg font-semibold mb-2">Upload Resource</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No new notifications
          </p>
        </InfoBox>
      </div>
    </div>
  );
};

export default StudyBuddyDashboard;

const InfoBox = ({ children, className }) => {
  return (
    <div
      className={`p-6 rounded-xl shadow-md border-2 border-gray-300 dark:border-gray-500 flex flex-col gap-4 overflow-y-auto ${className}`}
    >
      {children}
    </div>
  );
};

const CTANavButton = ({ text, link }) => {
  return (
    <Link to={link} className="w-full mt-auto">
      <button className="w-full bg-primary-500 px-2 py-2 text-lg text-white rounded-lg hover:bg-primary-600 transition-colors">
        {text}
      </button>
    </Link>
  );
};
