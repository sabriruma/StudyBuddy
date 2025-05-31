import React from 'react';
import './Matching.css';

const dummyMatches = [
    {
      id: 1,
      name: "Lena M.",
      subject: "Biology",
      description: "Late-night crammers welcome! 🌙",
      style: {
        backgroundColor: "#ffeaa7",
        border: "2px solid #fd79a8",
        color: "#2d3436",
      },
    },
    {
      id: 2,
      name: "Kevin B.",
      subject: "Physics",
      description: "Black holes and quantum fun!",
      style: {
        backgroundColor: "#a29bfe",
        border: "2px dashed #6c5ce7",
        color: "#2d3436",
      },
    },
    {
      id: 3,
      name: "Sara K.",
      subject: "Psychology",
      description: "Interactive study preferred 🧠",
      style: {
        backgroundColor: "#fab1a0",
        border: "2px solid #d63031",
        color: "#2d3436",
      },
    },
    {
      id: 4,
      name: "Ethan T.",
      subject: "Economics",
      description: "Morning sessions and graphs! 📈",
      style: {
        backgroundColor: "#55efc4",
        border: "2px solid #00b894",
        color: "#2d3436",
      },
    },
    {
      id: 5,
      name: "Maya W.",
      subject: "Chemistry",
      description: "Let’s bond over bonding 😉",
      style: {
        background: "linear-gradient(to right, #81ecec, #74b9ff)",
        border: "2px solid #0984e3",
        color: "#2d3436",
      },
    },
    {
      id: 6,
      name: "Alex Johnson",
      subject: "Computer Science",
      description: "Code collabs and Leetcode 💻",
      style: {
        backgroundColor: "#fdcb6e",
        border: "2px dashed #e17055",
        color: "#2d3436",
      },
    },
    {
        id: 7,
        name: "Nina P.",
        subject: "Art History",
        description: "Study with a splash of creativity! 🎨",
        style: {
          backgroundColor: "#ffb6b9",
          border: "2px solid #ff6b81",
          color: "#2d3436",
        },
      },
      {
        id: 8,
        name: "Leo Z.",
        subject: "Math",
        description: "Problem-solving parties all day 🔢",
        style: {
          background: "linear-gradient(to right, #f6d365, #fda085)",
          border: "2px solid #f0932b",
          color: "#2d3436",
        },
      },
  ];

export default function Matching() {
  return (
    <div className="matching-container">
      <div className="match-cards">
      {dummyMatches.map((match) => (
  <div
    key={match.id}
    className="match-card"
    style={match.style}
  >
    <h3>{match.name}</h3>
    <p><strong>Subject:</strong> {match.subject}</p>
    <p>{match.description}</p>
    <button className="connect-btn">Connect</button>
  </div>
))}

      </div>
    </div>
  );
}