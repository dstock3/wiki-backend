const express = require('express');
const router = express.Router();
const talkController = require('../controllers/talkController');

router.get('/', talkController.listAllTalkPages);
router.get('/:talkPageId', talkController.getTalkPage);
router.post('/', talkController.createTalkPage);
router.put('/:talkPageId', talkController.updateTalkPage);
router.delete('/:talkPageId', talkController.deleteTalkPage);

router.post('/:talkPageId/topics', talkController.createTopic);
router.put('/:talkPageId/topics/:topicId', talkController.updateTopic);
router.delete('/:talkPageId/topics/:topicId', talkController.deleteTopic);

router.post('/:talkPageId/topics/:topicId/comments', talkController.createComment);
router.put('/:talkPageId/topics/:topicId/comments/:commentId', talkController.updateComment);
router.delete('/:talkPageId/topics/:topicId/comments/:commentId', talkController.deleteComment);

module.exports = router;