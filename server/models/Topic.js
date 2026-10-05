const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  levelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Level', required: true },
  order: { type: Number, required: true },
  title: { type: String, required: true },
  learnContent: { type: String },
  complexityNotes: { type: String },
  startArray: { type: [Number] },
  missionText: { type: String },
  leetcodeLinks: [{ title: String, url: String }]
});

module.exports = mongoose.model('Topic', topicSchema);
