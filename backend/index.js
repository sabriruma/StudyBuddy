const express = require('express');
const admin = require('firebase-admin');
const apiRoutes = require('./api');
const cors = require('cors');

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
  ),
});

const db = admin.firestore();
module.exports = db;

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
