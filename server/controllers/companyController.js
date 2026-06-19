const Company = require('../models/Company');

exports.getCompanies = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = search ? { name: { $regex: search.trim(), $options: 'i' } } : {};
    const companies = await Company.find(filter)
      .select('name importantTopics companyInfo ctcRange interviewDifficulty')
      .sort({ name: 1 });
    res.json({ companies });
  } catch (err) {
    next(err);
  }
};

exports.getCompanyByName = async (req, res, next) => {
  try {
    const company = await Company.findOne({
      name: { $regex: `^${req.params.name.trim()}$`, $options: 'i' },
    });
    if (!company) {
      return res.status(404).json({ error: { message: 'Company not found', code: 'NOT_FOUND' } });
    }
    res.json({ company });
  } catch (err) {
    next(err);
  }
};
