const router = require('express').Router();
const Job = require('../models/Job');

router.get('/', async (req, res) => {
  if (!req.user) return res.json([]);

  const jobs = await Job.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .select('type status inputFileName outputUrl textBased errorMessage createdAt');

  res.json(jobs);
});

module.exports = router;
