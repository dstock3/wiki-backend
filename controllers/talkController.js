const TalkPage = require('../model/talk').TalkPage;
const Topic = require('../model/talk').Topic;
const Comment = require('../model/talk').Comment;
const Article = require('../model/article');
const User = require('../model/user').User;
const { check, validationResult } = require('express-validator');
const logger = require('../logger');
const sanitizeContent = require('../util/sanitize');

exports.listAllTalkPages = async (req, res) => {
  try {
    const talkPages = await TalkPage.find().populate('articleId');
    res.status(200).json(talkPages);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getTalkPage = async (req, res) => {
  try {
    const talkPage = await TalkPage.findOne({ articleId: req.params.articleId }).lean();
    if (!talkPage) {
      return res.status(404).json({ error: 'TalkPage not found' });
    }

    const isAdmin = req.user && req.user.isAdmin;

    let userIds = new Set();
    talkPage.discussions.forEach(topic => {
      userIds.add(topic.author);
      topic.comments.forEach(comment => userIds.add(comment.author));
    });
    userIds = [...userIds];

    const users = await User.find({ _id: { $in: userIds }}).lean();
    const userMap = users.reduce((acc, user) => {
      acc[user._id] = user.username;
      return acc;
    }, {});

    const currentUserId = req.user ? req.user._id.toString() : null;

    talkPage.discussions.forEach(topic => {
      const topicAuthorId = topic.author.toString();
      topic.author = userMap[topic.author];
      topic.isAuthorized = currentUserId && topicAuthorId === currentUserId;
      topic.comments.forEach(comment => {
        const commentAuthorId = comment.author.toString();
        comment.authorId = commentAuthorId;
        comment.author = userMap[comment.author];
        comment.isAuthorized = currentUserId && commentAuthorId === currentUserId;
      });
    });

    const article = await Article.findById(req.params.articleId).lean();
    talkPage.articleTitle = article.title;

    talkPage.articleAuthorId = article.author.toString();
    talkPage.currentUserId = currentUserId;

    const isAuthorized = req.user ? true : false;

    res.status(200).json({ talkPage, isAuthorized, isAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getTopicById = async (req, res) => {
  try {
    const talkPage = await TalkPage.findOne({ "discussions._id": req.params.topicId }).lean();
    if (!talkPage) {
      return res.status(404).json({ error: 'TalkPage containing the topic not found' });
    }

    const topic = talkPage.discussions.find(d => d._id.toString() === req.params.topicId);

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    res.status(200).json({ topic });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const topicValidationRules = [
  check('title')
    .trim()
    .notEmpty().withMessage('Title is required.')
    .isLength({ min: 3, max: 100 }).withMessage('Title should be between 3 and 100 characters long.'),
  check('content')
    .trim()
    .notEmpty().withMessage('Content is required.')
    .isLength({ min: 10, max: 5000 }).withMessage('Content should be between 10 and 5000 characters long.')
];

exports.createTopic = [
  ...topicValidationRules,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessage = errors.array().map(err => err.msg).join(', ');
      return res.status(400).json({ error: errorMessage });
    }

    const sanitizedContent = sanitizeContent(req.body.content);

    try {

      const article = await Article.findById(req.params.articleId);
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      const talkPage = await TalkPage.findById(article.talk);
      if (!talkPage) {
        return res.status(404).json({ error: 'TalkPage not found for this article' });
      }

      const newTopic = new Topic({
        title: req.body.title,
        content: sanitizedContent,
        author: req.user._id,
        talkPage: talkPage._id
      });

      talkPage.discussions.push(newTopic);
      await talkPage.save();

      logger.info({
        action: 'Topic created',
        topicId: newTopic._id,
        articleId: article._id,
        authorId: req.user._id,
        createdDate: new Date().toISOString()
      });

      const user = await User.findById(req.user._id);
      user.contributions.topics.push(newTopic._id);
      await user.save();

      res.status(201).json({ message: "Topic created successfully!" });
    } catch (error) {
      logger.error({
        action: 'Error creating topic',
        errorMessage: error.message,
        errorStack: error.stack,
        articleId: req.params.articleId,
        userId: req.user ? req.user._id : null
      });

      res.status(500).json({ error: error.message });
    }
  }
];

exports.updateTopic = [
  ...topicValidationRules,
  async (req, res) => {
    try {
      const { articleId, topicId } = req.params;
      const talkPage = await TalkPage.findOne({ articleId: articleId });

      if (!talkPage) {
        return res.status(404).json({ error: 'TalkPage not found' });
      }

      const topic = talkPage.discussions.id(topicId);
      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }

      const isAdmin = req.user && req.user.isAdmin;
      
      if (!isAdmin && !topic.author.equals(req.user._id)) {
        return res.status(403).json({ error: 'You do not have permission to edit this topic' });
      }

      const sanitizedContent = sanitizeContent(req.body.content);
      const updatedData = {
        ...req.body,
        content: sanitizedContent
      };

      Object.assign(topic, updatedData);
      await talkPage.save();

      logger.info({
        action: 'Topic updated',
        topicId: topic._id,
        talkPageId: talkPage._id,
        authorId: req.user._id,
        updatedDate: new Date().toISOString()
      });

      const user = await User.findById(req.user._id);
      if (user && !user.contributions.topics.includes(topic._id)) {
        user.contributions.topics.push(topic._id);
        await user.save();
      }
      
      res.status(200).json(topic);
    } catch (error) {
      logger.error({
        action: 'Error updating topic',
        errorMessage: error.message,
        errorStack: error.stack,
        topicId: req.params.topicId,
        talkPageId: talkPage ? talkPage._id : null,
        userId: req.user ? req.user._id : null
      });

      res.status(500).json({ error: error.message });
    }
  }
];

exports.deleteTopic = async (req, res) => {
  try {
    const { articleId, topicId } = req.params;

    const talkPage = await TalkPage.findOne({ articleId: articleId });

    if (!talkPage) {
      return res.status(404).json({ error: 'TalkPage not found' });
    }

    const topic = talkPage.discussions.id(topicId);

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const isAdmin = req.user && req.user.isAdmin;
    const articleAuthor = await Article.findById(articleId).author;

    let isAuthorized = false;

    if (req.user) {
      if (isAdmin || req.user._id.equals(articleAuthor) || req.user._id.equals(topic.author)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ error: 'You do not have permission to delete this topic' });
    }

    talkPage.discussions.pull({ _id: topicId });
    await talkPage.save();

    logger.info({
      action: 'Topic deleted',
      topicId: topicId,
      articleId: articleId,
      deletedBy: req.user._id,
      deletedDate: new Date().toISOString()
    });

    const user = await User.findById(req.user._id);
    const index = user.contributions.topics.indexOf(topicId);
    if (index > -1) {
      user.contributions.topics.splice(index, 1);
      await user.save();
    }

    res.status(200).json({ message: 'Topic deleted successfully' });
  } catch (error) {
    logger.error({
      action: 'Error deleting topic',
      errorMessage: error.message,
      errorStack: error.stack,
      topicId: req.params.topicId,
      articleId: req.params.articleId,
      userId: req.user ? req.user._id : null
    });
    
    res.status(500).json({ error: error.message });
  }
};

const commentValidationRules = [
  check('content')
    .trim()
    .notEmpty().withMessage('Comment content is required.')
];

exports.createComment = [
  ...commentValidationRules, 
  async (req, res) => {
    console.log("Starting comment creation middleware");
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          const errorMessage = errors.array().map(err => err.msg).join(', ');
          return res.status(400).json({ error: errorMessage });
      }

      const articleId = req.params.articleId;
      const topicId = req.params.topicId;

      const article = await Article.findById(articleId);
      if (!article) {
          throw new Error('Article not found');
      }

      const user = await User.findById(req.user._id);
      if (!user) {
          throw new Error('User not found');
      }

      const talkPage = await TalkPage.findOne({ articleId: articleId });
      const topic = talkPage.discussions.id(topicId);
      if (!topic) {
          throw new Error('Topic not found');
      }

      const sanitizedContent = sanitizeContent(req.body.content);

      const commentData = new Comment({
        author: user._id,
        authorName: user.username,
        content: sanitizedContent,
        topic: topic._id,
        date: new Date()
      });

      topic.comments.push(commentData);
      await talkPage.save();

      logger.info({
        action: 'Comment created',
        commentId: commentData._id,
        topicId: topic._id,
        articleId: articleId,
        authorId: req.user._id,
        createdDate: new Date().toISOString()
      });

      user.contributions.comments.push(article._id);
      await user.save();
      res.status(201).json({
        message: "Comment added successfully!",
        comment: {
          _id: commentData._id,
          content: commentData.content,
          authorId: user._id,
          author: user.username,
          date: commentData.date.toISOString()
        }
      });
    } catch (error) {
      console.error("Error in comment creation middleware:", error);
      logger.error({
        action: 'Error creating comment',
        errorMessage: error.message,
        errorStack: error.stack,
        articleId: req.params.articleId,
        topicId: req.params.topicId,
        userId: req.user ? req.user._id : null
      });

      res.status(500).json({ error: error.message });
    }
  }
];

exports.updateComment = [
  ...commentValidationRules,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessage = errors.array().map(err => err.msg).join(', ');
        return res.status(400).json({ error: errorMessage });
      }

      const { articleId, topicId, commentId } = req.params;

      const talkPage = await TalkPage.findOne({ articleId: articleId });
      if (!talkPage) {
        return res.status(404).json({ error: 'TalkPage not found' });
      }

      const topic = talkPage.discussions.id(topicId);
      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }

      const comment = topic.comments.id(commentId);
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      const isAdmin = req.user && req.user.isAdmin;
      if (!comment.author.equals(req.user._id) && !isAdmin) {
        return res.status(403).json({ error: 'You do not have permission to edit this comment' });
      }

      const sanitizedContent = sanitizeContent(req.body.content);
      comment.content = sanitizedContent;

      await talkPage.save();

      logger.info({
        action: 'Comment updated',
        commentId: comment._id,
        topicId: topic._id,
        authorId: req.user._id,
        updatedDate: new Date().toISOString()
      });

      res.status(200).json({
        ...comment.toObject(),
        author: req.user.username  
      });
    } catch (error) {
      logger.error({
        action: 'Error updating comment',
        errorMessage: error.message,
        errorStack: error.stack,
        commentId: req.params.commentId,  
        topicId: req.params.topicId,
        userId: req.user ? req.user._id : null
      });

      res.status(500).json({ error: error.message });
    }
  }
];

exports.deleteComment = async (req, res) => {
  const { articleId, topicId, commentId } = req.params;

  try {
    const talkPage = await TalkPage.findOne({ 'discussions._id': topicId });
    const article = await Article.findById(articleId);

    if (!talkPage || !article) {
      return res.status(404).json({ error: 'Article or TalkPage not found' });
    }

    const topic = talkPage.discussions.id(topicId);
    const comment = topic ? topic.comments.id(commentId) : null;

    let isAuthorized = req.user && req.user.isAdmin;
    if (req.user && comment) {
      if (req.user._id.equals(article.author) || req.user._id.equals(comment.author)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ error: 'You do not have permission to delete this comment' });
    }

    if (comment) {
      topic.comments.pull({ _id: commentId }); 
      await talkPage.save();
    } else {
      return res.status(404).json({ error: 'Comment not found' });
    }

    logger.info({
      action: 'Comment deleted',
      commentId: comment._id,
      topicId: topic._id,
      authorId: req.user._id,
      deletedDate: new Date().toISOString()
    });

    const user = await User.findById(req.user._id);
    if (user) {
      const index = user.contributions.comments.indexOf(commentId.toString()); 
      if (index > -1) {
        user.contributions.comments.splice(index, 1);
        await user.save();
      }
    }

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    logger.error({
      action: 'Error deleting comment',
      errorMessage: error.message,
      errorStack: error.stack,
      commentId: commentId,
      topicId: topicId,
      userId: req.user ? req.user._id : null
    });

    res.status(500).json({ error: error.message });
  }
};
