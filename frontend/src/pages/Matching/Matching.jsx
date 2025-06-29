import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../firebase/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import './Matching.css'; //test

export default function Matching() {
  const [user] = useAuthState(auth);
  const userId = user?.uid;
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchMatches();
    }
  }, [userId]);

  async function fetchMatches() {
    setLoading(true);
    try {
      const matchRef = collection(db, `users/${userId}/matches`);
      const q = query(matchRef, orderBy('mutualScore', 'desc'), limit(5));
      const snapshot = await getDocs(q);
      const matchList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMatches(matchList);
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
    setLoading(false);
  }

  async function runMatching() {
    if (!userId) return;
    setLoading(true);
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}api/runMatching/${userId}`, {
      method: 'POST'
      });
      await fetchMatches();
    } catch (error) {
      console.error("Error running matching:", error);
    }
    setLoading(false);
  }

  return (
    <div className="matching-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Your Top Matches</h2>
        <button className="refresh-btn" onClick={runMatching} disabled={loading}>
          {loading ? "Refreshing..." : "Run Matching Again"}
        </button>
      </div>

      <div className="match-cards">
        {matches.length === 0 && !loading && (
          <p>No matches found. Try running matching again!</p>
        )}

        {matches.map((match) => (
          <div key={match.userId} className="match-card" style={{ backgroundColor: '#ffeaa7', border: '2px solid #fd79a8' }}>
            <div className="match-header">
              <h3>{match.userName || "Student"}</h3>
              <div
                className="profile-photo"
                style={{ backgroundColor: '#fd79a8' }}
              >
                {match.userName ? match.userName.split(' ').map(n => n[0]).join('') : 'S'}
              </div>
            </div>
            <p><strong>Mutual Score:</strong> {match.mutualScore}</p>
            <p><strong>Reasons:</strong></p>
            <ul>
              {match.reasonsAtoB && match.reasonsAtoB.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
            <button className="connect-btn">Connect</button>
          </div>
        ))}
      </div>
    </div>
  );
}
