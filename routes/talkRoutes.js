const express = require('express');
const router = express.Router();
const talkController = require('../controllers/talkController');
const { ensureAuthenticated } = require('../middlewares/auth');

router.get('/', talkController.listAllTalkPages);
router.post('/', ensureAuthenticated, talkController.createTalkPage);
router.get('/:articleId', talkController.getTalkPage);
router.put('/:articleId', ensureAuthenticated, talkController.updateTalkPage);
router.delete('/:articleId', ensureAuthenticated, talkController.deleteTalkPage);

router.post('/:articleId/topics', ensureAuthenticated, talkController.createTopic);
router.put('/:articleId/topics/:topicId', ensureAuthenticated, talkController.updateTopic);
router.delete('/:articleId/topics/:topicId', ensureAuthenticated, talkController.deleteTopic);

router.post('/:articleId/topics/:topicId/comments', ensureAuthenticated, talkController.createComment);
router.put('/:articleId/topics/:topicId/comments/:commentId', ensureAuthenticated, talkController.updateComment);
router.delete('/:articleId/topics/:topicId/comments/:commentId', ensureAuthenticated, talkController.deleteComment);

module.exports = router;