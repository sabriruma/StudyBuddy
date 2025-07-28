import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebase/firebase";
import Sidebar from "../../components/Sidebar";
import { UsersIcon } from "@heroicons/react/24/outline";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";

const profileColors = [
  "#e17055", // orange
  "#0984e3", // primary
  "#6c5ce7", // purple
  "#00b894", // green
  "#d63031", // red
  "#fd79a8", // pink
  "#fdcb6e", // yellow
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
      const fetchData = async () => {
        await fetchMatches();
        await fetchConfirmedMatches();
        await fetchPendingRequests();
      };
      fetchData();
    }
  }, [userId]);

  // Fetch suggested matches (from algorithm) with enhanced profile data
  async function fetchMatches() {
    setLoading(true);
    try {
      const matchRef = collection(db, `users/${userId}/matches`);
      const q = query(matchRef, orderBy("mutualScore", "desc"), limit(6));
      const snapshot = await getDocs(q);

      const matchList = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const matchData = docSnap.data();
          const matchId = docSnap.id;

          const matchProfileRef = doc(db, `users/${matchId}`);
          const matchProfileSnap = await getDoc(matchProfileRef);

          let avatar = "";
          let userName = "";

          if (matchProfileSnap.exists()) {
            const matchProfile = matchProfileSnap.data();
            avatar = matchProfile.avatar || "";
            userName = `${matchProfile.firstName || ""} ${
              matchProfile.lastName || ""
            }`.trim();
          }

          return {
            id: matchId,
            avatar,
            userName,
            ...matchData,
          };
        })
      );

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
      snapshot.docs.forEach((doc) => {
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
      snapshot.docs.forEach((doc) => {
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
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(matchData),
        }
      );

      // 2) Immediately process any mutual requests for you
      await fetch(
        `${process.env.REACT_APP_API_BASE_URL}api/processMutualRequests/${userId}`,
        { method: "POST" }
      );

      // 3) Refresh all lists
      await fetchMatches();
      await fetchConfirmedMatches();
      await fetchPendingRequests();
    } catch (err) {
      console.error("Error connecting:", err);
    } finally {
      setLoading(false);
    }
  }

  // Trigger matching algorithm again (if needed)
  async function runMatching() {
    if (!userId) return;
    setLoading(true);
    try {
      await fetch(
        `${process.env.REACT_APP_API_BASE_URL}api/runMatching/${userId}`,
        {
          method: "GET",
        }
      );
      await fetchMatches();
    } catch (error) {
      console.error("Error running matching:", error);
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen text-black">
      {/* Main content on the right */}
      <div className="flex-1 max-w-6xl mx-auto px-4 py-8">
        {/* Centered Title with Refresh Button */}
        <div className="flex items-center justify-center text-center mb-10 justify-between">
          <div className="flex items-center space-x-2">
            <UsersIcon className="h-6 w-6 text-teal-400" />
            <h2 className="text-2xl font-bold dark:text-white">
              Best StudyBuddies For You
            </h2>
          </div>
          <button
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-md transition-all duration-300"
            onClick={runMatching}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh Matches"}
          </button>
        </div>

        {/* No Matches */}
        {matches.length === 0 && !loading && (
          <p className="text-gray-900 text-center mb-6">
            No matches found. Try running matching again!
          </p>
        )}

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {matches.map((match, index) => {
            const isConnected = confirmedMatches[match.id];
            const isPending = pendingRequests[match.id];

            return (
              <div
                key={match.id}
                className="dark:bg-[#1e293b] border border-slate-200 p-5 rounded-xl shadow-md flex flex-col"
              >
                <div className="flex items-center space-x-4 mb-3">
                  {match.avatar ? (
                    <img
                      src={match.avatar}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <div
                      className="h-12 w-12 rounded-full flex items-center justify-center text-black font-bold"
                      style={{
                        backgroundColor:
                          profileColors[index % profileColors.length],
                      }}
                    >
                      {match.userName
                        ? match.userName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : "S"}
                    </div>
                  )}
                  <h3 className="text-lg font-semibold dark:text-white">
                    {match.userName || "Student"}
                  </h3>
                </div>

                <div className="text-sm text-gray-900 dark:text-white mb-3">
                  <p className="dark:text-white">
                    <strong>Mutual Score:</strong> {match.mutualScore}%
                  </p>
                  <p className="dark:text-white">
                    <strong>Reputation Score:</strong>{" "}
                    {match.reputationScore || 1000}
                  </p>
                  <p className="mt-2 font-semibold">Reasons:</p>
                  <ul className="list-disc list-inside">
                    {match.reasonsAtoB?.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleConnect(match.id, match)}
                  disabled={isConnected || isPending}
                  className={`w-full mt-2 px-4 py-2 rounded-md text-sm font-medium transition-colors mt-auto ${
                    isConnected
                      ? "bg-gray-500 text-white cursor-not-allowed"
                      : isPending
                      ? "bg-yellow-500 text-white cursor-not-allowed"
                      : "bg-primary-600 hover:bg-primary-700 text-white"
                  }`}
                >
                  {isConnected
                    ? "Matched"
                    : isPending
                    ? "Request Sent"
                    : "Match"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
