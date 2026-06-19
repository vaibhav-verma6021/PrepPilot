const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  companyInfo: {
    about:           { type: String },
    headquarters:    { type: String },
    founded:         { type: String },
    employees:       { type: String },
    type:            { type: String },
    glassdoorRating: { type: Number },
  },
  hiringProcess:       [{ type: String }],
  importantTopics:     [{ type: String }],
  ctcRange: {
    fresher:     { type: String },
    experienced: { type: String },
  },
  interviewDifficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
  faqs: [{
    question: { type: String, required: true },
    answer:   { type: String, required: true },
  }],
  tips:  [{ type: String }],
  roles: [{ type: String }],
});

module.exports = mongoose.model('Company', companySchema);
