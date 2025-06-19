const express = require('express');
const router = express.Router();
const { runMatchingForUser } = require('./matchAlgorithmV2');

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

module.exports = router;
