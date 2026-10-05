const mongoose = require('mongoose');

const examTaskSchema = new mongoose.Schema({
  levelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Level', required: true },
  startArray: { type: [Number], required: true },
  goalArray: { type: [Number], required: true },
  maxSteps: { type: Number, required: true },
  points: { type: Number, default: 10 }
});

module.exports = mongoose.model('ExamTask', examTaskSchema);
