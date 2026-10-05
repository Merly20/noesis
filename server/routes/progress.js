import { Router } from 'express';
import Progress from '../models/Progress.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// GET /api/progress — current user's full progress
router.get('/', verifyToken, async (req, res) => {
  try {
    const progress = await Progress.findOne({ userId: req.user._id })
      .populate('practicedTopics', 'title levelId')
      .lean();

    if (!progress) {
      // Create empty progress if missing
      const fresh = await Progress.create({ userId: req.user._id });
      return res.json(fresh);
    }
    res.json(progress);
  } catch {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

export default router;
