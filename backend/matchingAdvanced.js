// matchingAdvanced.js
const admin = require('firebase-admin');
const db = admin.firestore(); // Get Firestore instance

// Elo-style rating update (+5 for positive, −4 for negative, clamped)
async function updateRating(uid, positiveFeedback) {
  const userRef = db.collection('users').doc(uid);
  const snap = await userRef.get();
  if (!snap.exists) throw new Error('User not found');
  const { reputationScore = 1000 } = snap.data();

  const delta = positiveFeedback ? 5 : -4;
  const newRep = Math.max(800, Math.min(1400, reputationScore + delta));

  await userRef.update({ reputationScore: newRep });
  return newRep;
}

module.exports = { updateRating };
