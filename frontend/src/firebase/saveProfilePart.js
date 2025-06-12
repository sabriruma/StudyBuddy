import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { getAuth } from "firebase/auth";

export const saveProfilePart = async (data) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.error("User not logged in.");
    return;
  }

  const userRef = doc(db, "users", user.uid);

  try {
    await setDoc(userRef, data, { merge: true });
    console.log("Saved:", data);
  } catch (error) {
    console.error("Firestore save error:", error);
  }
};
