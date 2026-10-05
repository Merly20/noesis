const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = new express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ username, email, passwordHash });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret');
    res.status(201).json({ user: { username, email, role: user.role, points: user.points }, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret');
    res.json({ user: { username: user.username, email, role: user.role, points: user.points }, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/me', auth, async (req, res) => {
  res.json({ user: { username: req.user.username, email: req.user.email, role: req.user.role, points: req.user.points } });
});

module.exports = router;
