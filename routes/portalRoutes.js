const express = require('express');
const router = express.Router();
const portalController = require('../controllers/portalController');
const { ensureAuthenticated } = require('../middlewares/auth');
const csurf = require('csurf');
const csrfProtection = csurf({ cookie: true });
const { uploadMiddleware } = require('../middlewares/multer');

router.get('/', portalController.getAllPortals);
router.get('/:portalId/articles', portalController.getArticlesByPortalId);
router.get('/:portalId', portalController.getPortalById);
router.post('/', ensureAuthenticated, csrfProtection, uploadMiddleware, portalController.createPortal);
router.put('/:portalId', ensureAuthenticated, csrfProtection, uploadMiddleware, portalController.updatePortal);
router.delete('/:portalId', ensureAuthenticated, csrfProtection, portalController.deletePortal);

module.exports = router;