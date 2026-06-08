const Goal = require('../models/Goal');

const todayString = () => new Date().toISOString().slice(0, 10);

exports.getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.user.id, date: todayString() }).sort({ createdAt: 1 });
    res.json({ goals });
  } catch (err) {
    next(err);
  }
};

exports.createGoal = async (req, res, next) => {
  try {
    const { title, date } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: { message: 'title is required', code: 'VALIDATION_ERROR' } });
    }

    const goal = await Goal.create({
      userId: req.user.id,
      title: title.trim(),
      date: date || todayString(),
    });

    res.status(201).json({ goal });
  } catch (err) {
    next(err);
  }
};

exports.toggleGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user.id });
    if (!goal) {
      return res.status(404).json({ error: { message: 'Goal not found', code: 'NOT_FOUND' } });
    }
    goal.completed = !goal.completed;
    await goal.save();
    res.json({ goal });
  } catch (err) {
    next(err);
  }
};

exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!goal) {
      return res.status(404).json({ error: { message: 'Goal not found', code: 'NOT_FOUND' } });
    }
    res.json({ message: 'Goal deleted' });
  } catch (err) {
    next(err);
  }
};
