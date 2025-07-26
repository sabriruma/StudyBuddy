const admin = require("firebase-admin");

// Check if Firebase is already initialized
let db;
try {
  db = admin.firestore();
} catch (error) {
  // If not initialized, this will be handled by index.js
  console.log("Firebase not yet initialized, will be handled by index.js");
  db = null;
}

module.exports = db;
