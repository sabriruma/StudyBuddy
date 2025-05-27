const express = require('express');
const cors = require('cors');
const findMatches = require('./matchAlgorithm');
const app = express();
app.use(cors());
const port = 3000;

app.get('/match/:uid', async (req, res) => {
  try {
    const matches = await findMatches(req.params.uid);
    res.json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error finding matches");
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
