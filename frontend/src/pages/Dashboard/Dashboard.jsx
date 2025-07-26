import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Dashboard.css";
import "./DashboardCalendar.css";

export default function Dashboard() {
  const [groupChats, setGroupChats] = useState([]);
  const [individualChats, setIndividualChats] = useState([]);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const currentUserId = user.uid;
      setCurrentUserId(currentUserId);

      try {
        // === GROUP CHATS ===
        const groupQuery = query(
          collection(db, "groups"),
          where("members", "array-contains", currentUserId)
        );
        const groupSnap = await getDocs(groupQuery);
        
        const groups = groupSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        const enrichedGroups = await Promise.all(groups.map(async group => {
          const messagesRef = collection(db, "groups", group.id, "messages");
          const latestQuery = query(messagesRef, orderBy("timestamp", "desc"), limit(1));
          const latestSnap = await getDocs(latestQuery);
          const lastMessage = latestSnap.docs[0]?.data();

          return {
            ...group,
            lastMessage,
            unreadCount: 0
          };
        }));
        console.log("enrichedGroups:", enrichedGroups)

        setGroupChats(enrichedGroups);

        // === INDIVIDUAL CHATS ===
        const chatQuery = query(
          collection(db, "chats"),
          where("members", "array-contains", currentUserId)
        );
        const chatSnap = await getDocs(chatQuery);
        
        const chats = chatSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        

        const enrichedChats = await Promise.all(
  chats.map(async (chat) => {
    const chatId = chat.id;

    const messagesRef = collection(db, "chats", chatId, "messages");
    const latestQuery = query(messagesRef, orderBy("timestamp", "desc"), limit(1));
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
      displayName: `${userData.firstName || "Unknown"} ${userData.lastName || ""}`.trim(),
      avatar: userData.avatar || "/defaultAvatar.png",
      lastMessage,
    };
  })
);
        setIndividualChats(enrichedChats.filter(Boolean));

        // === POTENTIAL MATCHES ===
        const matchesRef = collection(db, "users", currentUserId, "matches");
        const confirmedRef = collection(db, "users", currentUserId, "confirmedMatches");

        const [matchesSnap, confirmedSnap] = await Promise.all([
          getDocs(matchesRef),
          getDocs(confirmedRef)
        ]);

        const confirmedIds = new Set(confirmedSnap.docs.map(doc => doc.id));

        const recommended = await Promise.all(matchesSnap.docs
          .filter(matchDoc => !confirmedIds.has(matchDoc.id))
          .map(async (matchDoc) => {
            const matchData = matchDoc.data();
            const profileDoc = await getDoc(doc(db, "users", matchData.userId));
            const profile = profileDoc.exists() ? profileDoc.data() : {};

            return {
              userId: matchData.userId,
              avatar: profile.avatar || "/SBmascot.png",
              fullName: `${profile.firstName || "Unknown"} ${profile.lastName || ""}`,
              mutualScore: matchData.mutualScore || 0
            };
          }));

        setPotentialMatches(recommended);
        setLoading(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <img src="/SBmascot.png" alt="StudyBuddy Mascot" className="mascot-img" />
        <h1 className="dashboard-title">Welcome to the Den, StudyBuddy!</h1>
      </div>

      <div className="dashboard-cards">
        {/* === GROUP & CHAT CARD === */}
        <div className="dashboard-card">
          <h2>Chats & Study Groups</h2>
          {(groupChats.length > 0 || individualChats.length > 0) ? (
            <div className="recommended-matches-scroll">
              {groupChats.map(group => (
                <div key={group.id} className="group-chat-item"
                onClick={() => navigate(`/chat?groupId=${group.id}`)} 
                style={{ cursor: "pointer" }}
                >
              <div className="group-chat-header">
              <img
                src={group.avatar || "/defaultGroup.png"}
                alt="Group"
                className="group-chat-avatar"
              />
              <div className="group-chat-title">
                <h3>
                  {group.name}
                  {group.unreadCount > 0 && (
                  <span className="unread-badge">{group.unreadCount}</span>
                  )}
                </h3>
              </div>
            </div>
                  <p className="group-chat-preview">
                    <strong>{group.lastMessage?.from === currentUserId ? "You" : group.lastMessage?.senderName}:</strong>{" "}
                    {group.lastMessage?.text || "No messages yet."}
                  </p>
                </div>
              ))}
              {individualChats.map((chat) => (
                <div key={chat.chatId} className="group-chat-item">
  <div className="group-chat-header">
    <img
      src={chat.avatar || "/defaultAvatar.png"}
      alt={chat.displayName}
      className="group-chat-avatar"
    />
    <div className="group-chat-title">
      <h3>
        {chat.displayName}
        {chat.unreadCount > 0 && (
          <span className="unread-badge">{chat.unreadCount}</span>
        )}
      </h3>
    </div>
  </div>
  <p className="group-chat-preview">
    <strong>{chat.lastMessage?.senderId === currentUserId ? "You" : chat.displayName}:</strong>{" "}
    {chat.lastMessage?.text || "Say hello!"}
  </p>
</div>
              ))}
            </div>
          ) : (
            <p>No chats or groups yet. <Link to="/match">Start matching now!</Link></p>
          )}
          <Link to="/chat" className="dashboard-btn">Go to Chats</Link>
        </div>

        {/* === POTENTIAL MATCHES === */}
        <div className="dashboard-card recommended-matches-card">
          <h2>Recommended Matches</h2>
          {potentialMatches.length > 0 ? (
            <div className="recommended-matches-scroll">
              {potentialMatches.map((match, i) => (
                <div key={i} className="match-row">
                  <img
                    src={match.avatar}
                    alt="Avatar"
                    className="match-avatar"
                  />
                  <div className="match-info">
                    <strong>{match.fullName}</strong>
                    <p style={{ margin: 0, fontSize: "0.85rem" }}>Mutual Score: {match.mutualScore}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No new matches yet. <Link to="/matching">Run the matching algorithm to begin!</Link></p>
          )}
          <Link to="/matching" className="dashboard-btn">Find More Matches</Link>
        </div>

        {/* === CALENDAR === */}
        <div className="dashboard-card calendar-card">
          <h2>Upcoming Sessions</h2>
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
          <Link to="/calendar" className="dashboard-btn">View Full Calendar</Link>
        </div>
      </div>
    </div>
  );
}



