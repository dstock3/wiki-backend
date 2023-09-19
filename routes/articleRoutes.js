const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { ensureAuthenticated } = require('../middlewares/auth');

router.get('/', articleController.getAllArticles);
router.get('/:articleId', articleController.getArticleById);
router.post('/', ensureAuthenticated, articleController.createArticle);
router.put('/:articleId', ensureAuthenticated, articleController.updateArticle);
router.delete('/:articleId', ensureAuthenticated, articleController.deleteArticle);
router.get('/search', articleController.searchArticles);

module.exports = router;