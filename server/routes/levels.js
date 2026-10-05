const express = require('express');
const Level = require('../models/Level');
const Topic = require('../models/Topic');
const Progress = require('../models/Progress');
const { auth } = require('../middleware/auth');
const router = new express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const levels = await Level.find({ isPublished: true }).sort({ number: 1 });
    const progress = await Progress.findOne({ userId: req.user._id });
    
    const unlockedLevel = progress ? progress.unlockedLevel : 1;
    
    const levelsWithLock = levels.map(level => ({
      ...level.toObject(),
      isUnlocked: level.number <= unlockedLevel
    }));
    
    res.json(levelsWithLock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:levelId', auth, async (req, res) => {
  try {
    const level = await Level.findById(req.params.levelId);
    if (!level) return res.status(404).json({ error: 'Level not found' });
    
    const progress = await Progress.findOne({ userId: req.user._id });
    const unlockedLevel = progress ? progress.unlockedLevel : 1;
    if (level.number > unlockedLevel) return res.status(403).json({ error: 'Level is locked' });

    const topics = await Topic.find({ levelId: level._id }).sort({ order: 1 });
    res.json({ level, topics, practisedTopics: progress ? progress.practisedTopics : [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/topics/:topicId', auth, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.topicId);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    res.json(topic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/topics/:topicId/practice', auth, async (req, res) => {
  try {
    let progress = await Progress.findOne({ userId: req.user._id });
    if (!progress) {
      progress = new Progress({ userId: req.user._id });
    }
    
    if (!progress.practisedTopics.includes(req.params.topicId)) {
      progress.practisedTopics.push(req.params.topicId);
      await progress.save();
    }
    
    res.json({ success: true, practisedTopics: progress.practisedTopics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
