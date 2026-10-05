import mongoose from 'mongoose';

const examResultSchema = new mongoose.Schema({
  levelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Level' },
  taskId:  { type: mongoose.Schema.Types.ObjectId, ref: 'ExamTask' },
  stars:   { type: Number, min: 0, max: 3, default: 0 },
  pointsEarned: { type: Number, default: 0 },
  operations: [{
    op: String,
    index: Number,
    value: Number,
    _id: false,
  }],
  stepsUsed: Number,
  completedAt: { type: Date, default: Date.now },
}, { _id: false });

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  unlockedLevel: { type: Number, default: 1, min: 1 },
  practicedTopics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
  examResults: [examResultSchema],
  badges: [String],
}, { timestamps: true });

export default mongoose.model('Progress', progressSchema);
