const express = require('express');
const router = express.Router();
const portalController = require('../controllers/portalController');
const { ensureAuthenticated } = require('../middlewares/auth');
const csurf = require('csurf');
const csrfProtection = csurf({ cookie: true });
const { portalValidationRules } = require('../validators/portalValidator');

router.get('/', portalController.getAllPortals);
router.get('/:portalId', portalController.getPortalById);
router.post('/', ensureAuthenticated, csrfProtection, ...portalValidationRules, portalController.createPortal);
router.put('/:portalId', ensureAuthenticated, csrfProtection, ...portalValidationRules, portalController.updatePortal);
router.delete('/:portalId', ensureAuthenticated, csrfProtection, portalController.deletePortal);

module.exports = router;