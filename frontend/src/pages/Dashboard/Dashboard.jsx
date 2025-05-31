import React from "react";
import "./Dashboard.css";
import { Link } from "react-router-dom";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './DashboardCalendar.css'; // for custom styling override
import { useState } from 'react';

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

<div className="dashboard-card recommended-matches-card">
  <h2>Recommended Matches</h2>
  <div className="recommended-matches-scroll">
    <div className="match-row">
      <strong>Alex Johnson</strong> – Calculus
      <button className="connect-btn">View Profile</button>
    </div>
    <div className="match-row">
      <strong>Maria Lee</strong> – Physics
      <button className="connect-btn">View Profile</button>
    </div>
    <div className="match-row">
      <strong>Chris Tan</strong> – Chemistry
      <button className="connect-btn">View Profile</button>
    </div>
    <div className="match-row">
      <strong>Sophia Nguyen</strong> – Biology
      <button className="connect-btn">View Profile</button>
    </div>
    <div className="match-row">
      <strong>Liam Martinez</strong> – Economics
      <button className="connect-btn">View Profile</button>
    </div>
    {/* Add more match rows as needed */}
  </div>

  <Link to="/match" className="dashboard-btn">Find More Matches</Link>
</div>

<div className="dashboard-card calendar-card">
  <h2>Upcoming Sessions</h2>
  <Calendar
    onChange={() => {}}
    value={new Date()}
    tileClassName={({ date }) => {
      // Highlight specific upcoming dates (example)
      const highlightDates = ['2025-06-01', '2025-06-04', '2025-06-10'];
      const dateStr = date.toISOString().split('T')[0];
      return highlightDates.includes(dateStr) ? 'highlight' : null;
    }}
  />
  <Link to="/calendar" className="dashboard-btn">View Full Calendar</Link>
</div>
      </div>
    </div>
  );
}