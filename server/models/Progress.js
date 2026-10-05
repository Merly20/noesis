const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  unlockedLevel: { type: Number, default: 1 },
  practisedTopics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
  completedLevels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Level' }],
  examHistory: [{
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamTask' },
    stepsTaken: Number,
    stars: Number,
    timestamp: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Progress', progressSchema);
