const crypto = require('crypto');
const User = require('../models/User');
const Job = require('../models/Job');

module.exports = async function checkUsage(req, res, next) {
  const ANON_DAILY_LIMIT = Number(process.env.ANON_DAILY_LIMIT) || 50;
  const FREE_MONTHLY_LIMIT = Number(process.env.FREE_MONTHLY_LIMIT) || 50;

  // Anonymous users: rate-limit by hashed IP using recent Job count.
  if (!req.user) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    req.ipHash = crypto.createHash('sha256').update(ip + process.env.JWT_SECRET).digest('hex');

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const count = await Job.countDocuments({ user: null, ipHash: req.ipHash, createdAt: { $gte: since } });
    if (count >= ANON_DAILY_LIMIT) {
      return res.status(429).json({
        error: 'Free anonymous limit reached for today. Sign up to keep converting.',
      });
    }
    return next();
  }

  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ error: 'Account not found. Please log in again.' });

  if (user.plan === 'pro') return next(); // paid users skip the gate

  const now = new Date();
  const resetAt = new Date(user.usageResetAt);
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  if (now - resetAt > thirtyDays) {
    user.monthlyUsageCount = 0;
    user.usageResetAt = now;
    await user.save();
  }

  if (user.monthlyUsageCount >= FREE_MONTHLY_LIMIT) {
    return res
      .status(429)
      .json({ error: 'Free limit reached. Upgrade to Pro for unlimited conversions.' });
  }

  req.dbUser = user;
  next();
};
