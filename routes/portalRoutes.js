const express = require('express');
const router = express.Router();
const portalController = require('../controllers/portalController');

router.get('/', portalController.getAllPortals);
router.get('/:portalId', portalController.getPortalById);
router.post('/', portalController.createPortal);
router.put('/:portalId', portalController.updatePortal);
router.delete('/:portalId', portalController.deletePortal);

module.exports = router;