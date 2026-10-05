import { Router } from 'express';
import Level from '../models/Level.js';
import Topic from '../models/Topic.js';
import Progress from '../models/Progress.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// GET /api/levels — all levels with per-user lock state
router.get('/', verifyToken, async (req, res) => {
  try {
    const [levels, progress] = await Promise.all([
      Level.find({ isActive: true }).sort('order').lean(),
      Progress.findOne({ userId: req.user._id }).lean(),
    ]);
    const unlockedLevel = progress?.unlockedLevel ?? 1;

    const result = levels.map((lvl) => ({
      ...lvl,
      locked: lvl.number > unlockedLevel,
      completed: lvl.number < unlockedLevel,
      current: lvl.number === unlockedLevel,
    }));

    res.json(result);
  } catch {
    res.status(500).json({ error: 'Failed to fetch levels' });
  }
});

// GET /api/levels/:id — single level + its topics
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const level = await Level.findById(req.params.id).lean();
    if (!level) return res.status(404).json({ error: 'Level not found' });

    const [topics, progress] = await Promise.all([
      Topic.find({ levelId: level._id, isActive: true }).sort('order').lean(),
      Progress.findOne({ userId: req.user._id }).lean(),
    ]);

    const practicedIds = (progress?.practicedTopics ?? []).map(String);

    const topicsWithStatus = topics.map((t) => ({
      ...t,
      practiced: practicedIds.includes(String(t._id)),
    }));

    const practiceProgress = topics.length
      ? Math.round((practicedIds.filter(id => topics.some(t => String(t._id) === id)).length / topics.length) * 100)
      : 0;

    res.json({ level, topics: topicsWithStatus, practiceProgress });
  } catch {
    res.status(500).json({ error: 'Failed to fetch level' });
  }
});

export default router;
