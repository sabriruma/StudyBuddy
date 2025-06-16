// matchingAdvanced.js
const db = require('./firebase'); // Firestore setup

// Elo-style rating update (+5 for positive, −4 for negative, clamped)
async function updateRating(uid, positiveFeedback) {
  const userRef = db.collection('users').doc(uid);
  const snap = await userRef.get();
  if (!snap.exists) throw new Error('User not found');
  const { reputation = 1000 } = snap.data();

  const delta = positiveFeedback ? 5 : -4;
  const newRep = Math.max(800, Math.min(1400, reputation + delta));

  await userRef.update({ reputation: newRep });
  return newRep;
}

// Compute base compatibility score using actual user fields and importance weights
function getBaseScore(a, b) {
  // derive weights from current user's importance fields
  const weights = {
    courses:               5,                                           // default weight for course overlap
    studyEnvironment:      Number(a.importanceStudyEnvironment)  || 1,  // slider-based weight
    studyTime:             Number(a.importanceStudyTime)         || 1,
    studyMethod:           Number(a.importanceStudyMethod)       || 1,
    academicLevel:         1,                                           // fixed weight
    major:                 3                                            // fixed weight
  };

  let score = 0;

  // 1) courses overlap (array)
  if (Array.isArray(a.courses) && Array.isArray(b.courses)) {
    const sharedCourses = a.courses.filter(c => b.courses.includes(c));
    score += sharedCourses.length * weights.courses;
  }

  // 2) study environment match
  if (a.studyEnvironment === b.studyEnvironment) {
    score += weights.studyEnvironment;
  }

  // 3) study time match
  if (a.studyTime === b.studyTime) {
    score += weights.studyTime;
  }

  // 4) study method match
  if (a.studyMethod === b.studyMethod) {
    score += weights.studyMethod;
  }

  // 5) academic level match
  if (a.academicLevel === b.academicLevel) {
    score += weights.academicLevel;
  }

  // 6) major match
  if (a.major === b.major) {
    score += weights.major;
  }

  return score;
}

// ③ Find top-N matches for a given user ID
async function findMatches(currentUserId, topN = 5) {
  // Load current user's profile
  const meSnap = await db.collection('users').doc(currentUserId).get();
  if (!meSnap.exists) throw new Error('Current user not found');
  const me = meSnap.data();
  const myRep = me.reputation ?? 1000;

  // Reputation band ±6 points
  const minRep = myRep - 6;
  const maxRep = myRep + 6;

  // Pre-filter: reputation band and same location (optional)
  let query = db.collection('users')
    .where('reputation', '>=', minRep)
    .where('reputation', '<=', maxRep);

  if (me.location) {
    query = query.where('location', '==', me.location);
  }

  const candidatesSnap = await query.get();

  // Score each candidate
  const matches = [];
  candidatesSnap.forEach(doc => {
    if (doc.id === currentUserId) return;
    const user = doc.data();
    const base = getBaseScore(me, user);
    if (base > 0) {
      // Combine first and last name for display
      const name = user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || user.lastName || 'Unknown';
      matches.push({ uid: doc.id, name, score: base });
    }
  });

  // Sort by descending score and return top N
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, topN);
}

module.exports = { findMatches, updateRating };
