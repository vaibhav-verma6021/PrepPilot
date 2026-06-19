const router = require('express').Router();
const { getCompanies, getCompanyByName } = require('../controllers/companyController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', getCompanies);
router.get('/:name', getCompanyByName);

module.exports = router;
