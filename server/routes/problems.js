const router = require('express').Router();
const { getProblems, createProblem, updateProblem, deleteProblem, toggleDone, toggleRevision } = require('../controllers/problemController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', getProblems);
router.post('/', createProblem);
router.put('/:id', updateProblem);
router.patch('/:id/done', toggleDone);
router.patch('/:id/revision', toggleRevision);
router.delete('/:id', deleteProblem);

module.exports = router;
