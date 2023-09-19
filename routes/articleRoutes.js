const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { ensureAuthenticated } = require('../middlewares/auth');

router.post('/', articleController.createArticle);
router.get('/', articleController.getAllArticles);
router.get('/:id', articleController.getArticleById);
router.put('/:id', ensureAuthenticated, articleController.updateArticle);
router.delete('/:id', ensureAuthenticated, articleController.deleteArticle);
router.get('/search', ensureAuthenticated, articleController.searchArticles);

module.exports = router;