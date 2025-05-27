// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
 apiKey: "AIzaSyCACHqKU5UBVuBdeMFeEjJePW897X5yNI8",
  authDomain: "studybuddy-8f130.firebaseapp.com",
  projectId: "studybuddy-8f130",
  storageBucket: "studybuddy-8f130.firebasestorage.app",
  messagingSenderId: "515278129132",
  appId: "1:515278129132:web:9e861d468d59d95e0de2c9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
