const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { ensureAuthenticated } = require('../middlewares/auth');
const csurf = require('csurf');
const csrfProtection = csurf({ cookie: true });
const { uploadMiddleware } = require('../middlewares/multer');

router.get('/', articleController.getAllArticles);
router.get('/search', articleController.searchArticles);
router.get('/:articleId/:sectionId', articleController.getSection);
router.get('/:articleId', articleController.getArticleById);
router.post('/', ensureAuthenticated, csrfProtection, uploadMiddleware, articleController.createArticle);
router.put('/:articleId/:sectionId', ensureAuthenticated, csrfProtection, articleController.updateSection);
router.delete('/:articleId/:sectionId', ensureAuthenticated, csrfProtection, articleController.deleteSection);
router.put('/:articleId', ensureAuthenticated, csrfProtection, uploadMiddleware, articleController.updateArticle);
router.delete('/:articleId', ensureAuthenticated, csrfProtection, articleController.deleteArticle);

module.exports = router;