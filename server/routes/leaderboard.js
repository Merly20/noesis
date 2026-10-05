import { Router } from 'express';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// GET /api/leaderboard — top 50 by points
router.get('/', verifyToken, async (req, res) => {
  try {
    const users = await User.find({ role: 'learner' })
      .select('username points createdAt')
      .sort({ points: -1 })
      .limit(50)
      .lean();

    const ranked = users.map((u, i) => ({ ...u, rank: i + 1 }));

    // Also find current user's rank
    const myRank = ranked.findIndex(u => String(u._id) === String(req.user._id));

    res.json({ leaderboard: ranked, myRank: myRank === -1 ? null : myRank + 1 });
  } catch {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
