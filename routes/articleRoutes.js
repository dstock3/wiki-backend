const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { ensureAuthenticated } = require('../middlewares/auth');
const csurf = require('csurf');
const csrfProtection = csurf({ cookie: true });
const upload = require('../middlewares/multer');
const { articleValidationRules } = require('../validators/articleValidator');

router.get('/', articleController.getAllArticles);
router.get('/search', articleController.searchArticles);
router.get('/:articleId/:sectionId', articleController.getSection);
router.get('/:articleId', articleController.getArticleById);
router.post('/', ensureAuthenticated, csrfProtection, upload.single('image'), ...articleValidationRules, articleController.createArticle);
router.put('/:articleId/:sectionId', ensureAuthenticated, csrfProtection, upload.single('image'), articleController.updateSection);
router.delete('/:articleId/:sectionId', ensureAuthenticated, csrfProtection, articleController.deleteSection);
router.put('/:articleId', ensureAuthenticated, csrfProtection, upload.single('image'), ...articleValidationRules, articleController.updateArticle);
router.delete('/:articleId', ensureAuthenticated, csrfProtection, articleController.deleteArticle);

module.exports = router;