const express = require('express');
const router = express.Router();
const talkController = require('../controllers/talkController');
const { ensureAuthenticated } = require('../middlewares/auth');
const csurf = require('csurf');
const csrfProtection = csurf({ cookie: true });

router.get('/', talkController.listAllTalkPages);
router.post('/', ensureAuthenticated, csrfProtection, talkController.createTalkPage);
router.get('/:articleId', talkController.getTalkPage);
router.put('/:articleId', ensureAuthenticated, csrfProtection, talkController.updateTalkPage);
router.delete('/:articleId', ensureAuthenticated, csrfProtection, talkController.deleteTalkPage);

router.post('/:articleId/topics', ensureAuthenticated, csrfProtection, talkController.createTopic);
router.put('/:articleId/topics/:topicId', ensureAuthenticated, csrfProtection, talkController.updateTopic);
router.delete('/:articleId/topics/:topicId', ensureAuthenticated, csrfProtection, talkController.deleteTopic);

router.post('/:articleId/topics/:topicId/comments', ensureAuthenticated, csrfProtection, talkController.createComment);
router.put('/:articleId/topics/:topicId/comments/:commentId', ensureAuthenticated, csrfProtection, talkController.updateComment);
router.delete('/:articleId/topics/:topicId/comments/:commentId', ensureAuthenticated, csrfProtection, talkController.deleteComment);

module.exports = router;