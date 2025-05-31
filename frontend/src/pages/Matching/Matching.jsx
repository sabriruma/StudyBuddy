import React from 'react';
import './Matching.css';

const dummyMatches = [
  {
    id: 1,
    name: "Maria Lee",
    subject: "Biology",
    academicYear: "Sophomore",
    studyTime: "10 PM - 1 AM",
    description: "Late-night crammers welcome! 🌙",
    interests: "Genetics, flashcards, Pomodoro sessions",
    style: {
      backgroundColor: "#ffeaa7",
      border: "2px solid #fd79a8",
      color: "#2d3436",
    },
    profilePhotoColor: "#fd79a8",
  },
  {
    id: 2,
    name: "Chris Tan",
    subject: "Physics",
    academicYear: "Junior",
    studyTime: "Afternoons",
    description: "Black holes and quantum fun!",
    interests: "Problem sets, whiteboard brainstorming",
    style: {
      backgroundColor: "#a29bfe",
      border: "2px dashed #6c5ce7",
      color: "#2d3436",
    },
    profilePhotoColor:  "#6c5ce7",
  },
  {
    id: 3,
    name: "Sophia Nguyen",
    subject: "Psychology",
    academicYear: "Senior",
    studyTime: "Evenings",
    description: "Interactive study preferred 🧠",
    interests: "Case studies, group discussions",
    style: {
      backgroundColor: "#fab1a0",
      border: "2px solid #d63031",
      color: "#2d3436",
    },
    profilePhotoColor:  "#d63031",
  },
  {
    id: 4,
    name: "Liam Martinez",
    subject: "Economics",
    academicYear: "Freshman",
    studyTime: "7 AM - 9 AM",
    description: "Morning sessions and graphs! 📈",
    interests: "Charts, collaborative quizzes",
    style: {
      backgroundColor: "#55efc4",
      border: "2px solid #00b894",
      color: "#2d3436",
    },
    profilePhotoColor:  "#00b894",
  },
  {
    id: 5,
    name: "Samantha Lopez",
    subject: "Chemistry",
    academicYear: "Junior",
    studyTime: "Evenings & weekends",
    description: "Let’s bond over bonding 😉",
    interests: "Organic reactions, colorful diagrams",
    style: {
      background: "linear-gradient(to right, #81ecec, #74b9ff)",
      border: "2px solid #0984e3",
      color: "#2d3436",
    },
    profilePhotoColor:  "#0984e3",
  },
  {
    id: 6,
    name: "Alex Johnson",
    subject: "Computer Science",
    academicYear: "Senior",
    studyTime: "Flexible",
    description: "Code collabs and Leetcode 💻",
    interests: "Hackathons, algorithms, debugging",
    style: {
      backgroundColor: "#fdcb6e",
      border: "2px dashed #e17055",
      color: "#2d3436",
    },
    profilePhotoColor:  "#e17055",
  },
  {
    id: 7,
    name: "Marcus Gomez",
    subject: "Art History",
    academicYear: "Sophomore",
    studyTime: "Late afternoons",
    description: "Study with a splash of creativity! 🎨",
    interests: "Museum trips, visual flashcards",
    style: {
      backgroundColor: "#ffb6b9",
      border: "2px solid #ff6b81",
      color: "#2d3436",
    },
    profilePhotoColor:  "#ff6b81",
  },
  {
    id: 8,
    name: "Leo Jackson",
    subject: "Math",
    academicYear: "Freshman",
    studyTime: "Anytime after lunch",
    description: "Problem-solving parties all day 🔢",
    interests: "Theorems, proofs, competitive math",
    style: {
      background: "linear-gradient(to right, #f6d365, #fda085)",
      border: "2px solid #f0932b",
      color: "#2d3436",
    },
    profilePhotoColor:  "#f0932b",
  },
];

export default function Matching() {
  return (
    <div className="matching-container">
      <div className="match-cards">
        {dummyMatches.map((match) => (
          <div key={match.id} className="match-card" style={match.style}>
<div className="match-header">
    <h3>{match.name}</h3>
    <div
      className="profile-photo"
      style={{ backgroundColor: match.profilePhotoColor }}
      aria-label={`${match.name} profile photo`}
    >
      {match.name.split(' ').map(n => n[0]).join('')}
    </div>
  </div>
            <p><strong>Major:</strong> {match.subject}</p>
            <p><strong>Academic Year:</strong> {match.academicYear}</p>
            <p><strong>Study Time:</strong> {match.studyTime}</p>
            <p><strong>Interests:</strong> {match.interests}</p>
            <button className="connect-btn">Connect</button>
          </div>
        ))}
      </div>
    </div>
  );
}