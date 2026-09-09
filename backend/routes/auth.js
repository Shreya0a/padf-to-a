const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = require('express').Router();

const sign = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = await User.findOne({ email: String(email).toLowerCase() });
  if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email: String(email).toLowerCase(),
    name: typeof name === 'string' ? name.trim().slice(0, 60) : '',
    passwordHash,
  });

  res.status(201).json({ token: sign(user), user: user.toPublic() });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = await User.findOne({ email: String(email || '').toLowerCase() });
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const ok = await bcrypt.compare(password || '', user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

  res.json({ token: sign(user), user: user.toPublic() });
});

module.exports = router;
