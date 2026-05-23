const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?.id || req.ip,
  handler: (req, res) => {
    res.status(429).json({
      error: { message: 'Too many requests, please try again later', code: 'RATE_LIMIT_EXCEEDED' },
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    res.status(429).json({
      error: { message: 'Too many auth attempts, please try again later', code: 'RATE_LIMIT_EXCEEDED' },
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { aiLimiter, authLimiter };
