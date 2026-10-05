const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  badge: { type: String }, // badge image name/url
  isPublished: { type: Boolean, default: false }
});

module.exports = mongoose.model('Level', levelSchema);
