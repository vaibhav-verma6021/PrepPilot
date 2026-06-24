const router = require('express').Router();
const auth   = require('../middleware/auth');
const ctrl   = require('../controllers/placementBuddyController');

router.get('/profile',  auth, ctrl.getProfile);
router.post('/setup',   auth, ctrl.setup);
router.post('/chat',    auth, ctrl.chat);
router.get('/history',  auth, ctrl.getHistory);
router.delete('/reset', auth, ctrl.resetChat);

module.exports = router;
