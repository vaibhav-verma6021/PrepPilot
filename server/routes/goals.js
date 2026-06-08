const router = require('express').Router();
const { getGoals, createGoal, toggleGoal, deleteGoal } = require('../controllers/goalController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', getGoals);
router.post('/', createGoal);
router.patch('/:id', toggleGoal);
router.delete('/:id', deleteGoal);

module.exports = router;
