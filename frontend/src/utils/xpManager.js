// xpManager.js
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase'; // adjust if path differs

export const addXpToUser = async (userId, xpToAdd) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    console.error("User not found:", userId);
    return;
  }

  const userData = userSnap.data();
  const currentXp = userData.XP || 0;
  const currentLevel = userData.Level || 1;

  let newXp = currentXp + xpToAdd;
  let newLevel = currentLevel;

  if (newXp >= 100) {
    newLevel += Math.floor(newXp / 100);
    newXp = newXp % 100;
  }

  await updateDoc(userRef, {
    XP: newXp,
    Level: newLevel,
  });
};

