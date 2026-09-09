const router = require('express').Router();
const Job = require('../models/Job');

router.get('/', async (req, res) => {
  try {
    const convertedCount = await Job.countDocuments({ status: 'completed' });
    res.json({ convertedCount });
  } catch (err) {
    res.status(500).json({ error: 'Could not load stats' });
  }
});

module.exports = router;
