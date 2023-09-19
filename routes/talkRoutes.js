const express = require('express');
const router = express.Router();
const talkController = require('../controllers/talkController');
const { ensureAuthenticated } = require('../middlewares/auth');

router.get('/', talkController.listAllTalkPages);
router.get('/:talkPageId', talkController.getTalkPage);
router.post('/', ensureAuthenticated, talkController.createTalkPage);
router.put('/:talkPageId', ensureAuthenticated, talkController.updateTalkPage);
router.delete('/:talkPageId', ensureAuthenticated, talkController.deleteTalkPage);

router.post('/:talkPageId/topics', ensureAuthenticated, talkController.createTopic);
router.put('/:talkPageId/topics/:topicId', ensureAuthenticated, talkController.updateTopic);
router.delete('/:talkPageId/topics/:topicId', ensureAuthenticated, talkController.deleteTopic);

router.post('/:talkPageId/topics/:topicId/comments', ensureAuthenticated, talkController.createComment);
router.put('/:talkPageId/topics/:topicId/comments/:commentId', ensureAuthenticated, talkController.updateComment);
router.delete('/:talkPageId/topics/:topicId/comments/:commentId', ensureAuthenticated, talkController.deleteComment);

module.exports = router;