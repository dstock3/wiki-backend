const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { ensureAdmin } = require('../middlewares/auth');

router.get('/', ensureAdmin, logController.getAllLogs);
router.get('/error', ensureAdmin, logController.getAllErrorLogs); 
router.get('/info', ensureAdmin, logController.getAllInfoLogs);
router.get('/warn', ensureAdmin, logController.getAllWarnLogs);
router.get('/search', ensureAdmin, logController.searchLogs);

module.exports = router;

