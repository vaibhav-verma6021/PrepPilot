const router = require('express').Router();
const { analyzeJobMatch, getLatestJobMatch } = require('../controllers/jobmatchController');
const auth = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');

router.use(auth);

router.post('/analyze', aiLimiter, upload.single('resume'), analyzeJobMatch);
router.get('/latest', getLatestJobMatch);

module.exports = router;
