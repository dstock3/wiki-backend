const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { ensureAuthenticated } = require('../middlewares/auth');
const csurf = require('csurf');
const csrfProtection = csurf({ cookie: true });
const { articleValidationRules } = require('../validators/articleValidator');

router.get('/', articleController.getAllArticles);
router.get('/search', articleController.searchArticles);
router.get('/:articleId', articleController.getArticleById);
router.get('/:articleId/:sectionId', articleController.getSection);
router.post('/', ensureAuthenticated, csrfProtection, ...articleValidationRules, articleController.createArticle);
router.put('/:articleId', ensureAuthenticated, csrfProtection, ...articleValidationRules, articleController.updateArticle);
router.delete('/:articleId', ensureAuthenticated, csrfProtection, articleController.deleteArticle);
router.put('/:articleId/:sectionId', ensureAuthenticated, csrfProtection, articleController.updateSection);
router.delete('/:articleId/:sectionId', ensureAuthenticated, csrfProtection, articleController.deleteSection);

module.exports = router;