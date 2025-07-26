const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

// --- Handle local vs vercel service account key ---
let credential;

if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // Vercel (env var is a JSON string)
  credential = admin.credential.cert(JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS));
  console.log("Using service account from environment variable (Vercel)");
} else {
  // Local development (file)
  credential = admin.credential.cert(require('./serviceAccountKey.json'));
  console.log("Using local serviceAccountKey.json");
}

admin.initializeApp({ credential });

const db = admin.firestore();
module.exports = db;

const app = express();
app.use(cors());
app.use(express.json());

// Import API routes after Firebase is initialized
const apiRoutes = require('./api');
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
