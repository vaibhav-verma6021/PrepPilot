const mongoose = require('mongoose');

const jobMatchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  matchScore: { type: Number, required: true },
  missingSkills: [{ type: String }],
  strengths: [{ type: String }],
  suggestions: [{ type: String }],
  jobTitle: { type: String, trim: true },
  analyzedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('JobMatch', jobMatchSchema);
