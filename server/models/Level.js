import mongoose from 'mongoose';

const levelSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true, min: 1, max: 10 },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  icon: { type: String, default: '📦' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, required: true },
  comingSoon: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Level', levelSchema);
