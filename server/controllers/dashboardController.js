const Problem = require('../models/Problem');
const Resume = require('../models/Resume');
const JobMatch = require('../models/JobMatch');
const Goal = require('../models/Goal');

exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().slice(0, 10);

    // Build date range for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [problems, latestResume, latestJobMatch, todayGoals] = await Promise.all([
      Problem.find({ userId }),
      Resume.findOne({ userId }).sort({ analyzedAt: -1 }),
      JobMatch.findOne({ userId }).sort({ analyzedAt: -1 }),
      Goal.find({ userId, date: today }),
    ]);

    const totalSolved = problems.length;
    const easySolved = problems.filter((p) => p.difficulty === 'Easy').length;
    const mediumSolved = problems.filter((p) => p.difficulty === 'Medium').length;
    const hardSolved = problems.filter((p) => p.difficulty === 'Hard').length;

    // Problems solved per day for last 7 days
    const dayMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dayMap[d.toISOString().slice(0, 10)] = 0;
    }

    problems.forEach((p) => {
      const day = new Date(p.solvedDate).toISOString().slice(0, 10);
      if (dayMap[day] !== undefined) dayMap[day]++;
    });

    const problemsPerDay = Object.entries(dayMap).map(([date, count]) => ({ date, count }));

    const goalsCompleted = todayGoals.filter((g) => g.completed).length;
    const goalsTotal = todayGoals.length;

    // Topics breakdown
    const topicMap = {};
    problems.forEach((p) => {
      topicMap[p.topic] = (topicMap[p.topic] || 0) + 1;
    });
    const topicsBreakdown = Object.entries(topicMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      resumeScore: latestResume ? latestResume.score : null,
      jobMatchScore: latestJobMatch ? latestJobMatch.matchScore : null,
      goalsCompleted,
      goalsTotal,
      problemsPerDay,
      topicsBreakdown,
    });
  } catch (err) {
    next(err);
  }
};
