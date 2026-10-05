const express = require('express');
const ExamTask = require('../models/ExamTask');
const Level = require('../models/Level');
const Progress = require('../models/Progress');
const { auth } = require('../middleware/auth');
const memoryOps = require('../utils/memoryOps');
const router = new express.Router();

router.get('/:levelId', auth, async (req, res) => {
  try {
    const tasks = await ExamTask.find({ levelId: req.params.levelId });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:levelId/submit', auth, async (req, res) => {
  try {
    const { taskId, operations } = req.body;
    const task = await ExamTask.findById(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Validate operations using shared logic
    const { finalArray, totalSteps } = memoryOps.applyOperations(task.startArray, operations);
    
    // Check if goal is met
    const isCorrect = JSON.stringify(finalArray) === JSON.stringify(task.goalArray);
    if (!isCorrect) {
      return res.json({ success: false, message: 'Final array does not match goal array' });
    }
    if (totalSteps > task.maxSteps) {
      return res.json({ success: false, message: 'Too many steps' });
    }

    // Calculate stars
    let stars = 1;
    if (operations.length === 1) stars = 3;
    else if (operations.length === 2) stars = 2;

    // Update progress
    let progress = await Progress.findOne({ userId: req.user._id });
    if (!progress) {
      progress = new Progress({ userId: req.user._id });
    }
    
    // Check if task already completed
    const existingIndex = progress.examHistory.findIndex(h => h.taskId.toString() === taskId.toString());
    if (existingIndex > -1) {
      if (stars > progress.examHistory[existingIndex].stars) {
        progress.examHistory[existingIndex].stars = stars;
        progress.examHistory[existingIndex].stepsTaken = totalSteps;
      }
    } else {
      progress.examHistory.push({ taskId, stepsTaken: totalSteps, stars });
      req.user.points += task.points;
      await req.user.save();
    }

    await progress.save();

    // Check if level is complete (all tasks passed)
    const allTasks = await ExamTask.find({ levelId: req.params.levelId });
    const passedTasksCount = progress.examHistory.filter(h => allTasks.some(t => t._id.toString() === h.taskId.toString())).length;
    
    let levelUnlocked = false;
    if (passedTasksCount === allTasks.length) {
      if (!progress.completedLevels.includes(req.params.levelId)) {
        progress.completedLevels.push(req.params.levelId);
        
        // Unlock next level
        const currentLevel = await Level.findById(req.params.levelId);
        if (progress.unlockedLevel === currentLevel.number) {
          progress.unlockedLevel += 1;
          levelUnlocked = true;
        }
        await progress.save();
      }
    }

    res.json({ success: true, stars, totalSteps, levelUnlocked, newPoints: req.user.points });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
