import { Router } from 'express';
import ExamTask from '../models/ExamTask.js';
import Progress from '../models/Progress.js';
import User from '../models/User.js';
import Level from '../models/Level.js';
import { verifyToken } from '../middleware/auth.js';
import { validateExam } from '../shared/memoryOps.js';

const router = Router();

// GET /api/exam/level/:levelId — get all exam tasks for a level
router.get('/level/:levelId', verifyToken, async (req, res) => {
  try {
    const tasks = await ExamTask.find({ levelId: req.params.levelId, isActive: true })
      .sort('order').lean();
    if (!tasks.length) return res.status(404).json({ error: 'No exam tasks found for this level' });

    // Include goalArray so the client can display the goal to the learner.
    // Security note: server always re-validates on submit — client never scores itself.
    res.json(tasks);
  } catch {
    res.status(500).json({ error: 'Failed to fetch exam tasks' });
  }
});

// POST /api/exam/submit — validate a single task submission
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { taskId, operations } = req.body;
    if (!taskId || !Array.isArray(operations))
      return res.status(400).json({ error: 'taskId and operations[] are required' });

    const task = await ExamTask.findById(taskId).lean();
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // SERVER validates using shared memoryOps — client score is never trusted
    const result = validateExam(task.startArray, operations, task.goalArray, task.maxSteps);

    if (!result.passed) {
      return res.json({ passed: false, steps: result.steps, stars: 0, error: result.error });
    }

    // Calculate points: base * stars multiplier
    const pointsEarned = Math.round(task.points * (result.stars / 3));

    // Record result in Progress
    const progress = await Progress.findOneAndUpdate(
      { userId: req.user._id },
      {
        $push: {
          examResults: {
            levelId: task.levelId,
            taskId: task._id,
            stars: result.stars,
            pointsEarned,
            operations,
            stepsUsed: result.steps,
            completedAt: new Date(),
          },
        },
      },
      { upsert: true, new: true }
    );

    // Award points to user
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: pointsEarned } });

    // Check if all tasks for this level are now passed
    const allTasks = await ExamTask.find({ levelId: task.levelId, isActive: true }).lean();
    const passedTaskIds = new Set(
      progress.examResults
        .filter(r => String(r.levelId) === String(task.levelId) && r.stars > 0)
        .map(r => String(r.taskId))
    );
    const levelComplete = allTasks.every(t => passedTaskIds.has(String(t._id)));

    let levelUnlocked = false;
    let badgeAwarded = null;

    if (levelComplete) {
      const level = await Level.findById(task.levelId).lean();
      if (level) {
        const nextLevel = level.number + 1;
        // Only unlock if not already at a higher level
        if (progress.unlockedLevel <= level.number) {
          await Progress.findOneAndUpdate(
            { userId: req.user._id },
            { $max: { unlockedLevel: nextLevel } }
          );
          levelUnlocked = true;
        }

        // Badge for level 10 completion
        if (level.number === 10) {
          await Progress.findOneAndUpdate(
            { userId: req.user._id },
            { $addToSet: { badges: 'noesis-master' } }
          );
          badgeAwarded = 'noesis-master';
        }

        // Badge for each level completion
        const badge = `level-${level.number}-complete`;
        await Progress.findOneAndUpdate(
          { userId: req.user._id },
          { $addToSet: { badges: badge } }
        );
        badgeAwarded = badgeAwarded ?? badge;
      }
    }

    res.json({
      passed: true,
      steps: result.steps,
      stars: result.stars,
      pointsEarned,
      levelComplete,
      levelUnlocked,
      badgeAwarded,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Exam submission failed' });
  }
});

export default router;
