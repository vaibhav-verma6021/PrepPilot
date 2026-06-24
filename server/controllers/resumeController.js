const Resume = require('../models/Resume');
const { extractTextFromBuffer } = require('../utils/pdfParser');
const { analyzeResume } = require('../utils/gemini');

exports.analyzeResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'PDF file is required', code: 'VALIDATION_ERROR' } });
    }

    const resumeText = await extractTextFromBuffer(req.file.buffer);
    const analysis = await analyzeResume(resumeText);

    const resume = await Resume.create({
      userId: req.user.id,
      filename: req.file.originalname,
      resumeText,
      score: analysis.score,
      missingSkills: analysis.missingSkills || [],
      weakSections: analysis.weakSections || [],
      suggestions: analysis.suggestions || [],
    });

    res.status(201).json({ resume });
  } catch (err) {
    next(err);
  }
};

exports.getLatestResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id }).sort({ analyzedAt: -1 });
    if (!resume) {
      return res.status(404).json({ error: { message: 'No resume analysis found', code: 'NOT_FOUND' } });
    }
    res.json({ resume });
  } catch (err) {
    next(err);
  }
};
