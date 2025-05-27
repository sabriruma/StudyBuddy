const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://studybuddy-8f130.firebaseio.com"
});

const db = admin.firestore();
module.exports = db;
