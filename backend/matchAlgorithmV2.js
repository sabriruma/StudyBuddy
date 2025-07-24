const admin = require('firebase-admin');

const MAX_SCORE = 51; // Maximum possible raw score for normalization

function calculateMatchScore(userA, userB) {
  let score = 0;
  const reasons = [];

  const courseOverlap = userA.courses?.some(course => userB.courses?.includes(course));
  if (courseOverlap) {
    score += 10;
    reasons.push('Course overlap (+10)');
  }

  if (userA.studyMethod === userB.studyMethod) {
    const s = Number(userA.importanceStudyMethod) || 0;
    score += s;
    reasons.push(`Study method match (+${s})`);
  }

  if (userA.studyTime === userB.studyTime) {
    const s = Number(userA.importanceStudyTime) || 0;
    score += s;
    reasons.push(`Study time match (+${s})`);
  }

  if (userA.studyEnvironment === userB.studyEnvironment) {
    const s = Number(userA.importanceStudyEnvironment) || 0;
    score += s;
    reasons.push(`Study environment match (+${s})`);
  }

  if (userA.academicLevel === userB.academicLevel) {
    score += 5;
    reasons.push('Academic level match (+5)');
  }

  if (userA.school === userB.school) {
    score += 2;
    reasons.push('Same school (+2)');
  }

  if (userA.major === userB.major) {
    score += 4;
    reasons.push('Same major (+4)');
  }

  return { score, reasons };
}

function matchUsersV2(currentUser, allUsers) {
  const matchList = [];

  for (const otherUser of allUsers) {
    if (currentUser.id === otherUser.id) continue;

    const matchAtoB = calculateMatchScore(currentUser, otherUser);
    const matchBtoA = calculateMatchScore(otherUser, currentUser);

    if (matchAtoB.score < 0 || matchBtoA.score < 0) continue;

    const mutualScore = (matchAtoB.score + matchBtoA.score) / 2;
    // Normalize the score to be out of 100 and round to nearest integer
    const normalizedScore = Math.round((mutualScore / MAX_SCORE) * 100);

    if (normalizedScore >= Math.round((15 / MAX_SCORE) * 100)) { // keep the same threshold logic
      matchList.push({
        userId: otherUser.id,
        userName: `${otherUser.firstName} ${otherUser.lastName}`,
        mutualScore: normalizedScore,
        reasonsAtoB: matchAtoB.reasons,
        reasonsBtoA: matchBtoA.reasons
      });
    }
  }

  return matchList.sort((a, b) => b.mutualScore - a.mutualScore).slice(0, 5);
}

async function runMatchingForUser(userId) {
  const db = admin.firestore();

  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) throw new Error(`User ${userId} not found!`);

  const currentUser = { id: userId, ...userDoc.data() };

  const allUsersSnapshot = await db.collection('users').get();
  const allUsers = [];
  allUsersSnapshot.forEach(doc => {
    allUsers.push({ id: doc.id, ...doc.data() });
  });

  const matches = matchUsersV2(currentUser, allUsers);

  const batch = db.batch();
  const matchesRef = db.collection('users').doc(userId).collection('matches');

  const oldMatches = await matchesRef.get();
  oldMatches.forEach(doc => batch.delete(doc.ref));

  matches.forEach(match => {
    const matchDoc = matchesRef.doc(match.userId);
    batch.set(matchDoc, match);
  });

  await batch.commit();
}

module.exports = { calculateMatchScore, matchUsersV2, runMatchingForUser };
