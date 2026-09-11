require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const auth = require('./middleware/auth');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json({ limit: '11mb' }));

app.use(auth);

// Serve generated audio files (local storage provider)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/convert', require('./routes/convert'));
app.use('/api/history', require('./routes/history'));
app.use('/api/me', require('./routes/me'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/voices', require('./routes/voices'));

app.get('/health', (req, res) => res.json({ ok: true }));

const start = async () => {
  if (!process.env.MONGO_URI) {
    console.error('FATAL: MONGO_URI is not set. Refusing to start.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('FATAL: MongoDB connection failed:', err.message);
    process.exit(1);
  }

  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running on port ${port}`)) ;
};

start();
