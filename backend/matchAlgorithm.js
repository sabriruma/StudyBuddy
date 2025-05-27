const db = require('./firebase'); // Firestore setup

function getScore(userA, userB) {
  const weights = userA.weights;
  let score = 0;

  // Subjects
  const sharedSubjects = userA.subjects.filter(s => userB.subjects.includes(s));
  score += sharedSubjects.length * weights.subjects;

  // Study Style
  if (userA.studyStyle === userB.studyStyle)
    score += 1 * weights.studyStyle;

  // Availability 
  const sharedAvailability = userA.availability.filter(t => userB.availability.includes(t));
  score += sharedAvailability.length * weights.availability;

  // Academic Level
  if (userA.academicLevel === userB.academicLevel)
    score += 1 * weights.academicLevel;

  // Goals
  const sharedGoals = userA.goals.filter(g => userB.goals.includes(g));
  score += sharedGoals.length * weights.goals;

  return score;
}

async function findMatches(currentUserId) {
  const userDoc = await db.collection("users").doc(currentUserId).get();
  const currentUser = userDoc.data();

  const snapshot = await db.collection("users").get();
  let matches = [];

  snapshot.forEach(doc => {
    if (doc.id === currentUserId) return;
    const otherUser = doc.data();
    const score = getScore(currentUser, otherUser);
    if (score > 0) {
      matches.push({ userId: doc.id, name: otherUser.name, score });
    }
  });

  // Sort by highest score
  matches.sort((a, b) => b.score - a.score);

  return matches;
}

module.exports = findMatches;
