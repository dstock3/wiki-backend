const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { ensureAuthenticated } = require('../middlewares/auth');

router.get('/', articleController.getAllArticles);
router.get('/search', articleController.searchArticles);
router.get('/:articleId', articleController.getArticleById);
router.post('/', ensureAuthenticated, articleController.createArticle);
router.put('/:articleId', ensureAuthenticated, articleController.updateArticle);
router.delete('/:articleId', ensureAuthenticated, articleController.deleteArticle);

module.exports = router;