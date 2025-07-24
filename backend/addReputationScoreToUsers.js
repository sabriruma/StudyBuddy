const admin = require('firebase-admin');

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

async function addReputationScore() {
  const usersSnapshot = await db.collection('users').get();
  console.log(`Found ${usersSnapshot.size} users`);
  let updatedCount = 0;

  for (const doc of usersSnapshot.docs) {
    const data = doc.data();
    if (data.reputationScore === undefined) {
      console.log(`Updating user ${doc.id}`);
      await doc.ref.update({ reputationScore: 1000 });
      updatedCount++;
    } else {
      console.log(`User ${doc.id} already has reputationScore`);
    }
  }

  console.log(`Done! Updated ${updatedCount} users.`);
  process.exit(0);
}

addReputationScore().catch(err => {
  console.error(err);
  process.exit(1);
});