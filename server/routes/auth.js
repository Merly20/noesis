import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import { verifyToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'username, email and password are required' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (exists) {
      const field = exists.email === email.toLowerCase() ? 'email' : 'username';
      return res.status(409).json({ error: `That ${field} is already taken. Try another!` });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, passwordHash });

    // Init progress
    await Progress.create({ userId: user._id });

    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message).join('; ');
      return res.status(400).json({ error: msg });
    }
    res.status(500).json({ error: 'Registration failed. Our hamsters are tired.' });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    // `email` field may contain either an email or a username
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'name and password are required' });

    const id = String(email).trim();
    const user = await User.findOne(
      id.includes('@') ? { email: id.toLowerCase() } : { username: id }
    );
    if (!user) return res.status(401).json({ error: 'Invalid name or password' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid name or password' });

    const token = signToken(user);
    res.json({ token, user });
  } catch {
    res.status(500).json({ error: 'Login failed. Try again?' });
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  const user = await User.findById(req.user._id).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { passwordHash, ...safeUser } = user;
  res.json(safeUser);
});

export default router;
