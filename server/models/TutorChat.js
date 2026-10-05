import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true, maxlength: 4000 },
  ts: { type: Date, default: Date.now },
}, { _id: false });

const tutorChatSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', default: null },
  messages: {
    type: [messageSchema],
    default: [],
    validate: {
      validator(arr) { return arr.length <= 20; },
      message: 'Chat history capped at 20 messages',
    },
  },
}, { timestamps: true });

tutorChatSchema.index({ userId: 1, topicId: 1 }, { unique: true });

export default mongoose.model('TutorChat', tutorChatSchema);
