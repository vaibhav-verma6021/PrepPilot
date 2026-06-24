const PlacementProfile = require('../models/PlacementProfile');
const ChatMessage      = require('../models/ChatMessage');
const Resume           = require('../models/Resume');
const { chatWithPlacementBuddy } = require('../utils/gemini');

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await PlacementProfile.findOne({ userId: req.user.id });
    const latestResume = await Resume.findOne({ userId: req.user.id }).sort({ analyzedAt: -1 });
    res.json({
      profile: profile || null,
      resumeText: latestResume?.resumeText || null,
    });
  } catch (err) {
    next(err);
  }
};

exports.setup = async (req, res, next) => {
  try {
    const { targetCompany, resumeText } = req.body;
    if (!targetCompany?.trim()) {
      return res.status(400).json({ error: { message: 'targetCompany is required', code: 'VALIDATION_ERROR' } });
    }
    if (!resumeText?.trim()) {
      return res.status(400).json({ error: { message: 'resumeText is required', code: 'VALIDATION_ERROR' } });
    }

    const profile = await PlacementProfile.findOneAndUpdate(
      { userId: req.user.id },
      { targetCompany: targetCompany.trim(), resumeText: resumeText.trim() },
      { upsert: true, new: true }
    );

    res.json({ profile });
  } catch (err) {
    next(err);
  }
};

exports.chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ error: { message: 'message is required', code: 'VALIDATION_ERROR' } });
    }

    const profile = await PlacementProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(400).json({ error: { message: 'Setup your Placement Buddy profile first', code: 'NO_PROFILE' } });
    }

    const history = await ChatMessage.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(10)
      .then(msgs => msgs.reverse());

    const aiResponse = await chatWithPlacementBuddy(
      profile.targetCompany,
      profile.resumeText,
      history,
      message.trim()
    );

    await ChatMessage.insertMany([
      { userId: req.user.id, role: 'user',      message: message.trim() },
      { userId: req.user.id, role: 'assistant', message: aiResponse },
    ]);

    res.json({ reply: aiResponse });
  } catch (err) {
    next(err);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const messages = await ChatMessage.find({ userId: req.user.id }).sort({ timestamp: 1 });
    res.json({ messages });
  } catch (err) {
    next(err);
  }
};

exports.resetChat = async (req, res, next) => {
  try {
    await ChatMessage.deleteMany({ userId: req.user.id });
    await PlacementProfile.deleteOne({ userId: req.user.id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
