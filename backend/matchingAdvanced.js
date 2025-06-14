
const db = require('./firebase'); 

// rating update (+5 for positive, −4 for negative, clamped)
async function updateRating(uid, positiveFeedback) {
  const userRef = db.collection('users').doc(uid);
  const snap = await userRef.get();
  if (!snap.exists) throw new Error('User not found');
  const { reputation = 1000 } = snap.data();

  const delta = positiveFeedback ?  5 : -4;
  const newRep = Math.max(800, Math.min(1400, reputation + delta));

  await userRef.update({ reputation: newRep });
  return newRep;
}

//Compute base compatibility score
const WEIGHTS = {
  subjects:       2,
  availability:   2,
  studyStyle:     1,
  academicLevel:  1,
  goals:          1
};

function getBaseScore(a, b) {
  let score = 0;

  //subjects overlap
  score += a.subjects.filter(x => b.subjects.includes(x)).length * WEIGHTS.subjects;

  //availability overlap
  score += a.availability.filter(x => b.availability.includes(x)).length * WEIGHTS.availability;

  //same study style
  if (a.studyStyle === b.studyStyle) score += WEIGHTS.studyStyle;

  //same academic level
  if (a.academicLevel === b.academicLevel) score += WEIGHTS.academicLevel;

  //goals overlap
  score += a.goals.filter(x => b.goals.includes(x)).length * WEIGHTS.goals;

  return score;
}

// Find matches for a given user
async function findMatches(currentUserId, topN = 10) {
  // 1) load current user
  const meSnap = await db.collection('users').doc(currentUserId).get();
  if (!meSnap.exists) throw new Error('Current user not found');
  const me = meSnap.data();
  const myRep = me.reputation ?? 1000;

  // 2) reputation band ±6
  const minRep = myRep - 6;
  const maxRep = myRep + 6;

  // 3) pre-filter candidates by reputation band
  const candidatesSnap = await db
    .collection('users')
    .where('reputation', '>=', minRep)
    .where('reputation', '<=', maxRep)
    .get();

  // 4) score each candidate
  const matches = [];
  candidatesSnap.forEach(doc => {
    if (doc.id === currentUserId) return; 
    const user = doc.data();
    const base = getBaseScore(me, user);
    if (base > 0) {
      matches.push({ uid: doc.id, name: user.name, score: base });
    }
  });

  // 5) sort by descending score and return top 5
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 5);
}

module.exports = { findMatches, updateRating };
