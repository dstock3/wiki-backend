const express = require('express');
const router = express.Router();
const portalController = require('../controllers/portalController');
const { ensureAuthenticated } = require('../middlewares/auth');

router.get('/', portalController.getAllPortals);
router.get('/:portalId', portalController.getPortalById);
router.post('/', ensureAuthenticated, portalController.createPortal);
router.put('/:portalId', ensureAuthenticated, portalController.updatePortal);
router.delete('/:portalId', ensureAuthenticated, portalController.deletePortal);

module.exports = router;