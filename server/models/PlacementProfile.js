const mongoose = require('mongoose');

const placementProfileSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  targetCompany: { type: String, required: true, trim: true },
  resumeText:    { type: String, required: true },
  createdAt:     { type: Date, default: Date.now },
});

module.exports = mongoose.model('PlacementProfile', placementProfileSchema);
