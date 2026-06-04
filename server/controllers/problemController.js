const Problem = require('../models/Problem');

exports.getProblems = async (req, res, next) => {
  try {
    const { topic, difficulty, search } = req.query;
    const filter = { userId: req.user.id };

    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    if (search) filter.problemName = { $regex: search.trim(), $options: 'i' };

    const problems = await Problem.find(filter).sort({ solvedDate: -1 });
    res.json({ problems });
  } catch (err) {
    next(err);
  }
};

exports.createProblem = async (req, res, next) => {
  try {
    const { problemName, platform, difficulty, topic, solvedDate } = req.body;
    if (!problemName || !platform || !difficulty || !topic) {
      return res.status(400).json({ error: { message: 'problemName, platform, difficulty and topic are required', code: 'VALIDATION_ERROR' } });
    }

    const problem = await Problem.create({
      userId: req.user.id,
      problemName: problemName.trim(),
      platform,
      difficulty,
      topic,
      ...(solvedDate && { solvedDate }),
    });

    res.status(201).json({ problem });
  } catch (err) {
    next(err);
  }
};

exports.updateProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!problem) {
      return res.status(404).json({ error: { message: 'Problem not found', code: 'NOT_FOUND' } });
    }
    res.json({ problem });
  } catch (err) {
    next(err);
  }
};

exports.toggleDone = async (req, res, next) => {
  try {
    const problem = await Problem.findOne({ _id: req.params.id, userId: req.user.id });
    if (!problem) {
      return res.status(404).json({ error: { message: 'Problem not found', code: 'NOT_FOUND' } });
    }
    problem.isDone = !problem.isDone;
    await problem.save();
    res.json({ problem });
  } catch (err) {
    next(err);
  }
};

exports.toggleRevision = async (req, res, next) => {
  try {
    const problem = await Problem.findOne({ _id: req.params.id, userId: req.user.id });
    if (!problem) {
      return res.status(404).json({ error: { message: 'Problem not found', code: 'NOT_FOUND' } });
    }
    problem.isRevision = !problem.isRevision;
    await problem.save();
    res.json({ problem });
  } catch (err) {
    next(err);
  }
};

exports.deleteProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!problem) {
      return res.status(404).json({ error: { message: 'Problem not found', code: 'NOT_FOUND' } });
    }
    res.json({ message: 'Problem deleted' });
  } catch (err) {
    next(err);
  }
};
