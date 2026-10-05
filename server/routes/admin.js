import { Router } from 'express';
import User from '../models/User.js';
import Level from '../models/Level.js';
import Topic from '../models/Topic.js';
import ExamTask from '../models/ExamTask.js';
import Progress from '../models/Progress.js';
import Settings from '../models/Settings.js';
import TutorChat from '../models/TutorChat.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken, requireAdmin);

// ── Users ──────────────────────────────────────────────────────────────────
router.get('/users', async (_req, res) => {
  const users = await User.find().select('-passwordHash').sort('createdAt').lean();
  res.json(users);
});

router.patch('/users/:id', async (req, res) => {
  try {
    const { role, points } = req.body;
    const update = {};
    if (role && ['learner', 'admin'].includes(role)) update.role = role;
    if (typeof points === 'number') update.points = points;
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-passwordHash').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch { res.status(500).json({ error: 'Update failed' }); }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Progress.findOneAndDelete({ userId: req.params.id });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Delete failed' }); }
});

// ── Levels ─────────────────────────────────────────────────────────────────
router.get('/levels', async (_req, res) => {
  const levels = await Level.find().sort('order').lean();
  res.json(levels);
});

router.post('/levels', async (req, res) => {
  try {
    const level = await Level.create(req.body);
    res.status(201).json(level);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.patch('/levels/:id', async (req, res) => {
  try {
    const level = await Level.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).lean();
    if (!level) return res.status(404).json({ error: 'Level not found' });
    res.json(level);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/levels/:id', async (req, res) => {
  try {
    await Level.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Delete failed' }); }
});

// ── Topics ─────────────────────────────────────────────────────────────────
router.get('/topics', async (req, res) => {
  const filter = req.query.levelId ? { levelId: req.query.levelId } : {};
  const topics = await Topic.find(filter).populate('levelId', 'title number').sort({ levelId: 1, order: 1 }).lean();
  res.json(topics);
});

router.post('/topics', async (req, res) => {
  try {
    const topic = await Topic.create(req.body);
    res.status(201).json(topic);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.patch('/topics/:id', async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).lean();
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    res.json(topic);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/topics/:id', async (req, res) => {
  try {
    await Topic.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Delete failed' }); }
});

// ── Exam Tasks ─────────────────────────────────────────────────────────────
router.get('/exam-tasks', async (req, res) => {
  const filter = req.query.levelId ? { levelId: req.query.levelId } : {};
  const tasks = await ExamTask.find(filter).populate('levelId', 'title number').sort({ levelId: 1, order: 1 }).lean();
  res.json(tasks);
});

router.post('/exam-tasks', async (req, res) => {
  try {
    const task = await ExamTask.create(req.body);
    res.status(201).json(task);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.patch('/exam-tasks/:id', async (req, res) => {
  try {
    const task = await ExamTask.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).lean();
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/exam-tasks/:id', async (req, res) => {
  try {
    await ExamTask.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Delete failed' }); }
});

// ── Progress view ──────────────────────────────────────────────────────────
router.get('/progress', async (_req, res) => {
  const progress = await Progress.find().populate('userId', 'username email points').lean();
  res.json(progress);
});

// ── Settings ───────────────────────────────────────────────────────────────
router.get('/settings', async (_req, res) => {
  const settings = await Settings.find().lean();
  res.json(settings);
});

router.patch('/settings', async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: 'key is required' });
    const setting = await Settings.findOneAndUpdate(
      { key }, { key, value }, { upsert: true, new: true }
    ).lean();
    res.json(setting);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ── Tutor stats ────────────────────────────────────────────────────────────
router.get('/tutor-stats', async (_req, res) => {
  const chats = await TutorChat.find().populate('userId', 'username').lean();
  const stats = chats.map(c => ({
    username: c.userId?.username,
    userId: c.userId?._id,
    topicId: c.topicId,
    messageCount: c.messages.length,
    lastActive: c.updatedAt,
  }));
  res.json(stats);
});

export default router;
