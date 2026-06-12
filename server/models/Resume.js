const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  filename: { type: String, required: true },
  score: { type: Number, required: true },
  missingSkills: [{ type: String }],
  weakSections: [{ type: String }],
  suggestions: [{ type: String }],
  analyzedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Resume', resumeSchema);
