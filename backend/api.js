const express = require('express');
const router = express.Router();
const { runMatchingForUser } = require('./matchAlgorithmV2');
const { updateRating } = require('./matchingAdvanced');
const db = require('./index');

router.get('/runMatching/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    await runMatchingForUser(userId);
    res.status(200).send({ message: `Matching completed for user ${userId}` });
  } catch (error) {
    console.error(`Error running matching for user ${userId}:`, error);
    res.status(500).send({ error: error.message });
  }
});

// Send a connection request to another user
router.post('/matchRequest/:fromUserId/:toUserId', async (req, res) => {
  const { fromUserId, toUserId } = req.params;
  const matchData = req.body;
  
  try {
    // Check if both users exist
    const fromUserDoc = await db.collection('users').doc(fromUserId).get();
    const toUserDoc = await db.collection('users').doc(toUserId).get();
    
    if (!fromUserDoc.exists || !toUserDoc.exists) {
      return res.status(404).send({ error: 'One or both users not found' });
    }
    
    // Store the connection request
    await db.collection('users').doc(fromUserId)
      .collection('pendingRequests')
      .doc(toUserId)
      .set({
        ...matchData,
        timestamp: new Date(),
        status: 'pending'
      });
    
    res.status(200).send({ message: 'Connection request sent successfully' });
  } catch (error) {
    console.error('Error sending connection request:', error);
    res.status(500).send({ error: error.message });
  }
});

// Process mutual requests and create chats when both users connect
router.post('/processMutualRequests/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Get all pending requests from this user
    const pendingRequestsSnapshot = await db.collection('users').doc(userId)
      .collection('pendingRequests')
      .get();
    
    for (const requestDoc of pendingRequestsSnapshot.docs) {
      const targetUserId = requestDoc.id;
      const requestData = requestDoc.data();
      
      // Check if the target user has also sent a request to this user
      const mutualRequestDoc = await db.collection('users').doc(targetUserId)
        .collection('pendingRequests')
        .doc(userId)
        .get();
      
      if (mutualRequestDoc.exists) {
        // Both users want to connect - create a chat and mark as confirmed
        const chatId = `${userId}_${targetUserId}`;
        
        // Create chat document
        await db.collection('chats').doc(chatId).set({
          participants: [userId, targetUserId],
          createdAt: new Date(),
          lastMessage: null
        });
        
        // Mark both requests as confirmed
        await db.collection('users').doc(userId)
          .collection('pendingRequests')
          .doc(targetUserId)
          .update({ status: 'confirmed' });
        
        await db.collection('users').doc(targetUserId)
          .collection('pendingRequests')
          .doc(userId)
          .update({ status: 'confirmed' });
        
        // Add to confirmed matches for both users
        await db.collection('users').doc(userId)
          .collection('confirmedMatches')
          .doc(targetUserId)
          .set({
            chatId,
            confirmedAt: new Date(),
            ...requestData
          });
        
        await db.collection('users').doc(targetUserId)
          .collection('confirmedMatches')
          .doc(userId)
          .set({
            chatId,
            confirmedAt: new Date(),
            fromMatch: true
          });
        
        console.log(`Mutual connection created between ${userId} and ${targetUserId}`);
      }
    }
    
    res.status(200).send({ message: 'Mutual requests processed successfully' });
  } catch (error) {
    console.error('Error processing mutual requests:', error);
    res.status(500).send({ error: error.message });
  }
});

// Submit feedback for a study partner
router.post('/submitFeedback/:fromUserId/:toUserId', async (req, res) => {
  const { fromUserId, toUserId } = req.params;
  const { positiveFeedback } = req.body;
  
  try {
    // Check if both users exist
    const fromUserDoc = await db.collection('users').doc(fromUserId).get();
    const toUserDoc = await db.collection('users').doc(toUserId).get();
    
    if (!fromUserDoc.exists || !toUserDoc.exists) {
      return res.status(404).send({ error: 'One or both users not found' });
    }
    
    // Check if feedback already exists
    const feedbackRef = db.collection('users').doc(fromUserId)
      .collection('feedbackGiven')
      .doc(toUserId);
    
    const existingFeedback = await feedbackRef.get();
    if (existingFeedback.exists) {
      return res.status(400).send({ error: 'Feedback already submitted for this user' });
    }
    
    // Update the target user's reputation score
    const newReputation = await updateRating(toUserId, positiveFeedback);
    
    // Record the feedback
    await feedbackRef.set({
      positiveFeedback,
      timestamp: new Date(),
      targetUserId: toUserId
    });
    
    res.status(200).send({ 
      message: 'Feedback submitted successfully',
      newReputation 
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).send({ error: error.message });
  }
});

// Check if feedback should be shown (for testing: 1 message + 3 minutes)
router.get('/checkFeedbackEligibility/:fromUserId/:toUserId', async (req, res) => {
  const { fromUserId, toUserId } = req.params;
  
  try {
    // Check if feedback already given
    const feedbackRef = db.collection('users').doc(fromUserId)
      .collection('feedbackGiven')
      .doc(toUserId);
    
    const existingFeedback = await feedbackRef.get();
    if (existingFeedback.exists) {
      return res.status(200).send({ 
        eligible: false, 
        reason: 'Feedback already submitted' 
      });
    }
    
    // Get chat ID
    const chatId = [fromUserId, toUserId].sort().join('_');
    
    // Get messages count
    const messagesRef = db.collection('chats').doc(chatId).collection('messages');
    const messagesSnapshot = await messagesRef.get();
    const messageCount = messagesSnapshot.size;
    
    // Get connection time (from confirmedMatches)
    const confirmedMatchRef = db.collection('users').doc(fromUserId)
      .collection('confirmedMatches')
      .doc(toUserId);
    
    const confirmedMatchDoc = await confirmedMatchRef.get();
    if (!confirmedMatchDoc.exists) {
      return res.status(200).send({ 
        eligible: false, 
        reason: 'Users not connected' 
      });
    }
    
    const connectionTime = confirmedMatchDoc.data().confirmedAt.toDate();
    const timeSinceConnection = Date.now() - connectionTime.getTime();
    const minutesSinceConnection = timeSinceConnection / (1000 * 60);
    
    // Check eligibility (testing criteria: 1 message + 3 minutes)
    const messageEligible = messageCount >= 1;
    const timeEligible = minutesSinceConnection >= 3;
    
    const eligible = messageEligible && timeEligible;
    
    res.status(200).send({
      eligible,
      messageCount,
      minutesSinceConnection: Math.round(minutesSinceConnection),
      reason: eligible ? 'Eligible for feedback' : 
        !messageEligible ? 'Need more messages' : 'Need more time'
    });
    
  } catch (error) {
    console.error('Error checking feedback eligibility:', error);
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
