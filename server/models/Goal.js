const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
  date: {
    type: String,
    default: () => new Date().toISOString().slice(0, 10),
  },
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
