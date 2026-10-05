const express = require('express');
const Progress = require('../models/Progress');
const { auth } = require('../middleware/auth');
const router = new express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const progress = await Progress.findOne({ userId: req.user._id })
      .populate('completedLevels', 'number title')
      .populate('examHistory.taskId', 'points maxSteps');
      
    if (!progress) {
      return res.json({
        unlockedLevel: 1,
        completedLevels: [],
        examHistory: [],
        points: req.user.points
      });
    }
    
    res.json({
      unlockedLevel: progress.unlockedLevel,
      completedLevels: progress.completedLevels,
      examHistory: progress.examHistory,
      points: req.user.points
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
