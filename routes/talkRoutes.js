const express = require('express');
const router = express.Router();
const talkController = require('../controllers/talkController');
const { ensureAuthenticated } = require('../middlewares/auth');
const csurf = require('csurf');
const csrfProtection = csurf({ cookie: true });
const { talkValidationRules } = require('../validators/talkValidator');

router.post('/:articleId/topics', ensureAuthenticated, csrfProtection, /*...talkValidationRules,*/ talkController.createTopic);
router.get('/:articleId/topics/:topicId', talkController.getTopicById);
router.put('/:articleId/topics/:topicId', ensureAuthenticated, csrfProtection, ...talkValidationRules, talkController.updateTopic);
router.delete('/:articleId/topics/:topicId', ensureAuthenticated, csrfProtection, talkController.deleteTopic);

router.post('/:articleId/topics/:topicId/comments', ensureAuthenticated, csrfProtection, ...talkValidationRules, talkController.createComment);
router.put('/:articleId/topics/:topicId/comments/:commentId', ensureAuthenticated, csrfProtection, ...talkValidationRules, talkController.updateComment);
router.delete('/:articleId/topics/:topicId/comments/:commentId', ensureAuthenticated, csrfProtection, talkController.deleteComment);

router.get('/:articleId', talkController.getTalkPage);
router.get('/', talkController.listAllTalkPages);

module.exports = router;