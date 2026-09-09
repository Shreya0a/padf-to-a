const router = require('express').Router();
const User = require('../models/User');

router.get('/', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Account not found' });

  const freeLimit = Number(process.env.FREE_MONTHLY_LIMIT) || 5;
  res.json({
    ...user.toPublic(),
    freeMonthlyLimit: freeLimit,
    remaining: user.plan === 'pro' ? null : Math.max(0, freeLimit - user.monthlyUsageCount),
  });
});

module.exports = router;
