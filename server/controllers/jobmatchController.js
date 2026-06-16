const JobMatch = require('../models/JobMatch');
const { extractTextFromBuffer } = require('../utils/pdfParser');
const { analyzeJobMatch } = require('../utils/gemini');

exports.analyzeJobMatch = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'PDF file is required', code: 'VALIDATION_ERROR' } });
    }
    const { jobDescription, jobTitle } = req.body;
    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ error: { message: 'jobDescription is required', code: 'VALIDATION_ERROR' } });
    }

    const resumeText = await extractTextFromBuffer(req.file.buffer);
    const analysis = await analyzeJobMatch(resumeText, jobDescription.trim());

    const jobMatch = await JobMatch.create({
      userId: req.user.id,
      matchScore: analysis.matchScore,
      missingSkills: analysis.missingSkills || [],
      strengths: analysis.strengths || [],
      suggestions: analysis.suggestions || [],
      jobTitle: jobTitle ? jobTitle.trim() : undefined,
    });

    res.status(201).json({ jobMatch });
  } catch (err) {
    next(err);
  }
};

exports.getLatestJobMatch = async (req, res, next) => {
  try {
    const jobMatch = await JobMatch.findOne({ userId: req.user.id }).sort({ analyzedAt: -1 });
    if (!jobMatch) {
      return res.status(404).json({ error: { message: 'No job match analysis found', code: 'NOT_FOUND' } });
    }
    res.json({ jobMatch });
  } catch (err) {
    next(err);
  }
};
