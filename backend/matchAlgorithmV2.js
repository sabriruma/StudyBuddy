const admin = require('firebase-admin');

function calculateMaxPossibleScore(user) {
  let maxScore = 0;
  
  // Course overlap (fixed +10)
  maxScore += 10;
  
  // Study method (user-defined importance)
  maxScore += Number(user.importanceStudyMethod) || 0;
  
  // Study time (user-defined importance)
  maxScore += Number(user.importanceStudyTime) || 0;
  
  // Study environment (user-defined importance)
  maxScore += Number(user.importanceStudyEnvironment) || 0;
  
  // Academic level (fixed +5)
  maxScore += 5;
  
  // Same school (fixed +2)
  maxScore += 2;
  
  // Same major (fixed +4)
  maxScore += 4;
  
  return maxScore;
}

function calculateMatchScore(userA, userB) {
  let score = 0;
  const reasons = [];

  const courseOverlap = userA.courses?.some(course => userB.courses?.includes(course));
  
  // Debug: Log course overlap detection
  if (userA.id && userB.id) {
    console.log(`Course overlap check - ${userA.id} vs ${userB.id}:`, {
      userACourses: userA.courses,
      userBCourses: userB.courses,
      hasOverlap: courseOverlap
    });
  }
  
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

function matchUsersV2(currentUser, allUsers, excludeUserIds = []) {
  const matchList = [];
  
  // Calculate the maximum possible score for the current user
  const maxPossibleScore = calculateMaxPossibleScore(currentUser);

  // Filter users by reputation score band (±10 points from current user's reputation)
  const myReputation = currentUser.reputationScore || 1000;
  const reputationBand = 10; // Adjustable band width
  const minReputation = myReputation - reputationBand;
  const maxReputation = myReputation + reputationBand;

  // Filter candidates by reputation score and exclude connected users
  const reputationFilteredUsers = allUsers.filter(user => {
    const userReputation = user.reputationScore || 1000;
    return user.id !== currentUser.id && 
           !excludeUserIds.includes(user.id) &&
           userReputation >= minReputation && 
           userReputation <= maxReputation;
  });

  console.log(`User ${currentUser.id} (reputation: ${myReputation}) - Found ${reputationFilteredUsers.length} users within reputation band [${minReputation}-${maxReputation}] (excluding ${excludeUserIds.length} connected users)`);

  for (const otherUser of reputationFilteredUsers) {
    // Debug: Log user data for first few users
    if (reputationFilteredUsers.indexOf(otherUser) < 3) {
      console.log(`Debug - Current User Courses:`, currentUser.courses);
      console.log(`Debug - Other User (${otherUser.id}) Courses:`, otherUser.courses);
    }
    
    const matchAtoB = calculateMatchScore(currentUser, otherUser);
    const matchBtoA = calculateMatchScore(otherUser, currentUser);

    if (matchAtoB.score < 0 || matchBtoA.score < 0) continue;

    const mutualScore = (matchAtoB.score + matchBtoA.score) / 2;
    // Normalize the score to be out of 100 based on the user's actual maximum possible score
    const normalizedScore = Math.round((mutualScore / maxPossibleScore) * 100);

    if (normalizedScore >= Math.round((15 / maxPossibleScore) * 100)) { // back to original threshold of 15
      matchList.push({
        userId: otherUser.id,
        userName: `${otherUser.firstName} ${otherUser.lastName}`,
        mutualScore: normalizedScore,
        reasonsAtoB: matchAtoB.reasons,
        reasonsBtoA: matchBtoA.reasons,
        reputationScore: otherUser.reputationScore || 1000
      });
    }
  }

  return matchList.sort((a, b) => b.mutualScore - a.mutualScore); // Return all matches, let caller decide how many to take
}

async function runMatchingForUser(userId) {
  const db = admin.firestore();

  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) throw new Error(`User ${userId} not found!`);

  const currentUser = { id: userId, ...userDoc.data() };
  console.log(`Matching for user ${userId} - Current user data:`, {
    courses: currentUser.courses,
    studyMethod: currentUser.studyMethod,
    studyTime: currentUser.studyTime,
    studyEnvironment: currentUser.studyEnvironment
  });

  // Get all users
  const allUsersSnapshot = await db.collection('users').get();
  const allUsers = [];
  allUsersSnapshot.forEach(doc => {
    allUsers.push({ id: doc.id, ...doc.data() });
  });

  // Get connected users (users the current user has confirmed matches with)
  const confirmedMatchesRef = db.collection('users').doc(userId).collection('confirmedMatches');
  const confirmedMatchesSnapshot = await confirmedMatchesRef.get();
  const connectedUserIds = [];
  confirmedMatchesSnapshot.forEach(doc => {
    connectedUserIds.push(doc.id);
  });

  console.log(`User ${userId} has ${connectedUserIds.length} confirmed connections`);

  // Get all potential matches (excluding connected users)
  const allPotentialMatches = matchUsersV2(currentUser, allUsers, connectedUserIds);
  
  console.log(`Found ${allPotentialMatches.length} potential matches after filtering`);

  // Take top 6 matches (or however many are available)
  const maxMatches = 6;
  const finalMatches = allPotentialMatches.slice(0, maxMatches);
  
  console.log(`Selected top ${finalMatches.length} matches`);

  // Store the final matches
  const batch = db.batch();
  const matchesRef = db.collection('users').doc(userId).collection('matches');

  // Clear old matches
  const oldMatches = await matchesRef.get();
  oldMatches.forEach(doc => batch.delete(doc.ref));

  // Set new matches
  finalMatches.forEach(match => {
    const matchDoc = matchesRef.doc(match.userId);
    batch.set(matchDoc, match);
  });

  await batch.commit();
  console.log(`Final match count: ${finalMatches.length}`);
}

module.exports = { calculateMatchScore, matchUsersV2, runMatchingForUser };
