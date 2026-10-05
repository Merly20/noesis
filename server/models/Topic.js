import mongoose from 'mongoose';

const leetcodeLinkSchema = new mongoose.Schema({
  label: String,
  url: String,
  number: Number,
}, { _id: false });

const complexitySchema = new mongoose.Schema({
  time: String,
  space: String,
  summary: String,
}, { _id: false });

const topicSchema = new mongoose.Schema({
  levelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Level', required: true },
  title: { type: String, required: true, trim: true },
  order: { type: Number, required: true },
  learnContent: { type: String, default: '' }, // Rich HTML/markdown notes
  complexityNotes: complexitySchema,
  startArray: { type: [Number], default: [1, 2, 3, 4] },
  missionText: { type: String, default: '' },
  leetcodeLinks: [leetcodeLinkSchema],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

topicSchema.index({ levelId: 1, order: 1 });

export default mongoose.model('Topic', topicSchema);
