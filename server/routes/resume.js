const router = require('express').Router();
const { analyzeResume, getLatestResume } = require('../controllers/resumeController');
const auth = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');

router.use(auth);

router.post('/analyze', aiLimiter, upload.single('resume'), analyzeResume);
router.get('/latest', getLatestResume);

module.exports = router;
