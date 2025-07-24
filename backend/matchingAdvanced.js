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

module.exports = { updateRating };
