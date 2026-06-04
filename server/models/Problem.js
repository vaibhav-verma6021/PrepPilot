const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  problemName: { type: String, required: true, trim: true },
  platform: {
    type: String,
    required: true,
    enum: ['LeetCode', 'GeeksforGeeks', 'HackerRank', 'Codeforces'],
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard'],
  },
  topic: {
    type: String,
    required: true,
    enum: ['Arrays', 'Strings', 'Linked List', 'Trees', 'Graphs', 'DP', 'Sorting', 'Binary Search'],
  },
  solvedDate: { type: Date, default: Date.now },
  isDone:     { type: Boolean, default: false },
  isRevision: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);
