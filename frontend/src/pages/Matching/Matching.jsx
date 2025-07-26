import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../firebase/firebase';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import './Matching.css';

const profileColors = [
  '#e17055', // orange
  '#0984e3', // blue
  '#6c5ce7', // purple
  '#00b894', // green
  '#d63031', // red
  '#fd79a8', // pink
  '#fdcb6e', // yellow
];

export default function Matching() {
  const [user] = useAuthState(auth);
  const userId = user?.uid;
  const [matches, setMatches] = useState([]);
  const [confirmedMatches, setConfirmedMatches] = useState({});
  const [pendingRequests, setPendingRequests] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchMatches();
      fetchConfirmedMatches();
      fetchPendingRequests();
    }
  }, [userId]);

  // Fetch suggested matches (from algorithm)
  async function fetchMatches() {
    setLoading(true);
    try {
      const matchRef = collection(db, `users/${userId}/matches`);
      const q = query(matchRef, orderBy('mutualScore', 'desc'), limit(6));
      const snapshot = await getDocs(q);

      const matchList = await Promise.all(snapshot.docs.map(async (docSnap) => {
  const matchData = docSnap.data();
  const matchId = docSnap.id;

  const matchProfileRef = doc(db, `users/${matchId}`);
  const matchProfileSnap = await getDoc(matchProfileRef);

  let avatar = '';
  let userName = '';

  if (matchProfileSnap.exists()) {
    const matchProfile = matchProfileSnap.data();
    avatar = matchProfile.avatar || '';
    userName = `${matchProfile.firstName || ''} ${matchProfile.lastName || ''}`.trim();
  }

  return {
    id: matchId,
    avatar,
    userName,
    ...matchData
  };
}));

    setMatches(matchList);
  } catch (error) {
    console.error("Error fetching matches:", error);
  }
  setLoading(false);
  }

  // Fetch confirmed matches
  async function fetchConfirmedMatches() {
    try {
      const ref = collection(db, `users/${userId}/confirmedMatches`);
      const snapshot = await getDocs(ref);
      const confirmed = {};
      snapshot.docs.forEach(doc => {
        confirmed[doc.id] = true;
      });
      setConfirmedMatches(confirmed);
    } catch (error) {
      console.error("Error fetching confirmed matches:", error);
    }
  }

  // Fetch pending connection requests
  async function fetchPendingRequests() {
    try {
      const ref = collection(db, `users/${userId}/pendingRequests`);
      const snapshot = await getDocs(ref);
      const pending = {};
      snapshot.docs.forEach(doc => {
        pending[doc.id] = true;
      });
      setPendingRequests(pending);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  }

  async function handleConnect(matchUserId, matchData) {
    setLoading(true);
    try {
      // 1) Record your one-way intent
      await fetch(
        `${process.env.REACT_APP_API_BASE_URL}api/matchRequest/${userId}/${matchUserId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(matchData),
        }
      );

      // 2) Immediately process any mutual requests for you
      await fetch(
        `${process.env.REACT_APP_API_BASE_URL}api/processMutualRequests/${userId}`,
        { method: 'POST' }
      );

      // 3) Refresh all lists
      await fetchMatches();
      await fetchConfirmedMatches();
      await fetchPendingRequests();
    } catch (err) {
      console.error('Error connecting:', err);
    } finally {
      setLoading(false);
    }
  }
  

  
  // Trigger matching algorithm again (if needed)
  async function runMatching() {
    if (!userId) return;
    setLoading(true);
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}api/runMatching/${userId}`, {
        method: 'GET'
      });
      await fetchMatches();
    } catch (error) {
      console.error("Error running matching:", error);
    }
    setLoading(false);
  }

  return (
    <div className="matching-container">
<div className="matching-header">
  <h2 className="matching-title">Best StudyBuddies For You</h2>
  <button className="refresh-btn" onClick={runMatching} disabled={loading}>
    {loading ? "Refreshing..." : "Run Matching Again"}
  </button>
</div>

      <div className="match-cards">
        {matches.length === 0 && !loading && (
          <p className="no-matches">No matches found. Try running matching again!</p>
        )}

        {matches.map((match) => {
          const isConnected = confirmedMatches[match.id];
          const isPending = pendingRequests[match.id];

          return (
            <div key={match.id} className="match-card">
<div className="match-card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
  {match.avatar ? (
    <img
      src={match.avatar}
      alt="Avatar"
      style={{
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid #ccc',
      }}
    />
  ) : (
    <div
      className="profile-photo"
      style={{
        backgroundColor: profileColors[matches.indexOf(match) % profileColors.length],
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        color: 'white',
      }}
    >
      {match.userName ? match.userName.split(' ').map(n => n[0]).join('') : 'S'}
    </div>
  )}
  <h3 style={{ margin: 0 }}>{match.userName || "Student"}</h3>
</div>

              <div className="match-details">
                <p><strong>Mutual Score:</strong> {match.mutualScore}%</p>
                <p><strong>Reputation Score:</strong> {match.reputationScore || 1000}</p>
                <p><strong>Reasons:</strong></p>
                <ul>
                  {match.reasonsAtoB && match.reasonsAtoB.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>

              <button
                className={`connect-btn ${isConnected ? 'connected' : ''} ${isPending ? 'pending' : ''}`}
                onClick={() => handleConnect(match.id, match)}
                disabled={isConnected || isPending}
              >
                {isConnected ? "Connected!" : isPending ? "Request Sent" : "Connect"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

}

