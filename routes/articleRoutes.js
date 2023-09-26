const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { ensureAuthenticated } = require('../middlewares/auth');
const csurf = require('csurf');
const csrfProtection = csurf({ cookie: true });

router.get('/', articleController.getAllArticles);
router.get('/search', articleController.searchArticles);
router.get('/:articleId', articleController.getArticleById);
router.post('/', ensureAuthenticated, csrfProtection, articleController.createArticle);
router.put('/:articleId', ensureAuthenticated, csrfProtection, articleController.updateArticle);
router.delete('/:articleId', ensureAuthenticated, csrfProtection, articleController.deleteArticle);

module.exports = router;