import React from "react";
import "./Dashboard.css";
import { Link } from "react-router-dom";

const groupChats = [
  {
    id: 1,
    name: "Calculus Study Group",
    lastMessage: {
      sender: "Alice",
      text: "Don’t forget our session at 5 PM!",
    },
  },
  {
    id: 2,
    name: "Physics Problem Solvers",
    lastMessage: {
      sender: "Bob",
      text: "I just solved problem 4 on the worksheet.",
    },
  },
  {
    id: 3,
    name: "Intro to CS Team",
    lastMessage: {
      sender: "Charlie",
      text: "Push your code when you're done testing.",
    },
  },
];

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Welcome Back, StudyBuddy!</h1>

      <div className="dashboard-cards">
      <div className="dashboard-card">
  <h2>Study Groups</h2>
  <div className="group-chat-list">
    {groupChats.map((group) => (
      <div key={group.id} className="group-chat-item">
        <h3>{group.name}</h3>
        <p>
          <strong>{group.lastMessage.sender}:</strong> {group.lastMessage.text}
        </p>
      </div>
    ))}
  </div>
  <Link to="/groups" className="dashboard-btn">View Groups</Link>
</div>

        <div className="dashboard-card">
          <h2>Recommended Matches</h2>
          <p>Find new study partners based on your profile.</p>
          <Link to="/match" className="dashboard-btn">Find Matches</Link>
        </div>

        <div className="dashboard-card">
          <h2>Upcoming Sessions</h2>
          <p>Next session: Math 204 – Today at 4:00 PM</p>
          <Link to="/calendar" className="dashboard-btn">View Schedule</Link>
        </div>
      </div>
    </div>
  );
}