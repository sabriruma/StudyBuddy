// feedbackController.js
// Enforces feedback eligibility and updates reputation after thumbs‑up / thumbs‑down

const admin = require('firebase-admin');
const db = admin.firestore();
const { updateRating } = require('./matchingAdvanced');

// ---- Configurable rules ----------------------------------------------
const MIN_MESSAGES_EACH   = 3;                  // ≥3 messages per participant
const FEEDBACK_WAIT_MS    = 2 * 60 * 60 * 1000; // 2 hours since first msg
// ----------------------------------------------------------------------

/**
 * Helper: returns { firstMsgDate, countSelf, countOther }
 */
async function analyseChat(chatId, userId) {
  const [uidA, uidB] = chatId.split('_');
  const partnerId = uidA === userId ? uidB : uidA;
  if (!partnerId) throw new Error('chatId must be "uidA_uidB"');

  const msgsSnap = await db.collection('chats').doc(chatId)
    .collection('messages').get();
  if (msgsSnap.empty) throw new Error('No messages yet');

  let firstMsg = null;
  let countSelf = 0;
  let countOther = 0;

  msgsSnap.forEach(doc => {
    const { from, timestamp } = doc.data();
    if (!timestamp?.toDate) return;
    const t = timestamp.toDate();
    if (!firstMsg || t < firstMsg) firstMsg = t;
    if (from === userId) countSelf++; else if (from === partnerId) countOther++;
  });
  return { firstMsg, countSelf, countOther, partnerId };
}

/**
 * Determines if userId may leave feedback in chatId.
 * Throws descriptive Error on violation.
 */
async function canSubmitFeedback(chatId, userId) {
  const { firstMsg, countSelf, countOther, partnerId } = await analyseChat(chatId, userId);

  if (countSelf < MIN_MESSAGES_EACH || countOther < MIN_MESSAGES_EACH)
    throw new Error(`Each user must send at least ${MIN_MESSAGES_EACH} messages before feedback`);

  if (Date.now() - firstMsg.getTime() < FEEDBACK_WAIT_MS)
    throw new Error('Feedback allowed only after 2 hours of conversation');

  return partnerId;
}

/**
 * submitChatFeedback(chatId, userId, positive)
 * Records thumbs‑up/down and updates partner reputation (+5 / −4).
 */
async function submitChatFeedback(chatId, userId, positive) {
  const partnerId = await canSubmitFeedback(chatId, userId);

  // idempotency: overwrite existing vote from same user
  const fbRef = db.collection('chats').doc(chatId)
    .collection('feedback').doc(userId);
  await fbRef.set({ positive: !!positive, timestamp: admin.firestore.FieldValue.serverTimestamp() });

  // Apply reputation delta to partner
  await updateRating(partnerId, positive);
}

module.exports = { canSubmitFeedback, submitChatFeedback };
