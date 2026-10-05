import { Router } from 'express';
import Topic from '../models/Topic.js';
import Progress from '../models/Progress.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// GET /api/topics/:id — full topic detail
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id).populate('levelId', 'title number').lean();
    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    const progress = await Progress.findOne({ userId: req.user._id }).lean();
    const practiced = (progress?.practicedTopics ?? []).some(id => String(id) === String(topic._id));

    res.json({ ...topic, practiced });
  } catch {
    res.status(500).json({ error: 'Failed to fetch topic' });
  }
});

// POST /api/topics/:id/practice-done — mark topic as practiced
router.post('/:id/practice-done', verifyToken, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id).lean();
    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    await Progress.findOneAndUpdate(
      { userId: req.user._id },
      { $addToSet: { practicedTopics: topic._id } },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Practice recorded! 🎉' });
  } catch {
    res.status(500).json({ error: 'Failed to record practice' });
  }
});

export default router;
