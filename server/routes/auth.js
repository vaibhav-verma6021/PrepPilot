const router = require('express').Router();
const { signup, login, me, updateProfile, changePassword } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.get('/me', auth, me);
router.patch('/profile', auth, updateProfile);
router.patch('/password', auth, changePassword);

module.exports = router;
