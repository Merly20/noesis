import mongoose from 'mongoose';

const examTaskSchema = new mongoose.Schema({
  levelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Level', required: true },
  order: { type: Number, required: true },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  startArray: { type: [Number], required: true },
  goalArray: { type: [Number], required: true },
  maxSteps: { type: Number, required: true, min: 1 },
  points: { type: Number, default: 100 },
  hint: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

examTaskSchema.index({ levelId: 1, order: 1 });

export default mongoose.model('ExamTask', examTaskSchema);
