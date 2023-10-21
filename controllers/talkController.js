const TalkPage = require('../model/talk').TalkPage;
const Topic = require('../model/talk').Topic;
const Comment = require('../model/talk').Comment;
const Article = require('../model/article');
const User = require('../model/user').User;
const { validationResult } = require('express-validator');

exports.listAllTalkPages = async (req, res) => {
  try {
    const talkPages = await TalkPage.find().populate('articleId');
    res.status(200).json(talkPages);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createTalkPage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }
  try {
    const newTalkPage = new TalkPage(req.body);
    const savedTalkPage = await newTalkPage.save();
    res.status(201).json(savedTalkPage);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getTalkPage = async (req, res) => {
  try {
    const talkPage = await TalkPage.findOne({ articleId: req.params.articleId });
    if (!talkPage) {
      return res.status(404).json({ error: 'TalkPage not found' });
    }
    res.status(200).json({talkPage, isAuthorized: true});
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createTopic = async (req, res) => {
  /*
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }*/

  const articleId = req.params.articleId;
  
  try {
    const article = await Article.findById(articleId);
    if (!article) {
        return res.status(404).json({ error: 'Article not found' });
    }

    const talkPage = await TalkPage.findById(article.talk);
    if (!talkPage) {
        return res.status(404).json({ error: 'TalkPage not found for this article' });
    }

    const newTopic = new Topic({
      ...req.body,
      author: req.user._id,
      talkPage: talkPage._id

    });

    talkPage.discussions.push(newTopic);
    await talkPage.save();

    const user = await User.findById(req.user._id);
    user.contributions.topics.push(newTopic._id);
    await user.save();

    res.status(201).json({ message: "Topic created successfully!" });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
};

exports.updateTopic = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }
  const { talkPageId, topicId } = req.params;
  try {
    const talkPage = await TalkPage.findById(talkPageId);
    
    if (!talkPage) {
      return res.status(404).json({ error: 'TalkPage not found' });
    }

    const topic = talkPage.discussions.id(topicId);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    if (!topic.author.equals(req.user._id)) {
      return res.status(403).json({ error: 'You do not have permission to edit this topic' });
    }

    Object.assign(topic, req.body);
    await talkPage.save();

    const user = await User.findById(req.user._id);

    if (!user.contributions.topics.includes(topic._id)) {
      user.contributions.topics.push(topic._id);
      await user.save();
    }
    
    res.status(200).json(topic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTopic = async (req, res) => {
    const { talkPageId, topicId } = req.params;
    try {
      const talkPage = await TalkPage.findById(talkPageId);
      const topic = talkPage.discussions.id(topicId);
      const articleId = talkPage.articleId;
      const articleAuthor = await Article.findById(articleId).author;

      let isAuthorized = false;

      if (req.user) {
        if ((req.user._id.equals(articleAuthor)) | (req.user._id.equals(topic.author))) {
          isAuthorized = true;
        }
      }

      if (!isAuthorized) {
        return res.status(403).json({ error: 'You do not have permission to delete this topic' });
      }

      talkPage.discussions.id(topicId).remove();
      await talkPage.save();

      const user = await User.findById(req.user._id);
      const index = user.contributions.topics.indexOf(topicId);
      if (index > -1) {
        user.contributions.topics.splice(index, 1);
        await user.save();
      }

      res.status(200).json({ message: 'Topic deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

exports.createComment = async (req, res) => {
  try {
      const articleId = req.params.articleId;
      const topicId = req.params.topicId;
      
      const talkPage = await TalkPage.findOne({ articleId: articleId });

      if (!talkPage) {
          throw new Error('TalkPage not found');
      }

      const article = await Article.findById(talkPage.articleId);
      if (!article) {
          throw new Error('Article not found');
      }

      const user = await User.findById(req.user._id);
      if (!user) {
          throw new Error('User not found');
      }

      const topic = talkPage.discussions.id(topicId);
      if (!topic) {
          throw new Error('Topic not found');
      }

      const commentData = {
          author: user._id,
          content: req.body.content,
          topic: topic._id
      };
      
      topic.comments.push(commentData);
      await talkPage.save();

      user.contributions.comments.push(article._id);
      await user.save();

      res.status(201).json({ message: "Comment added successfully!" });
  } catch (error) {
      console.error("Error Stack Trace:", error.stack);
      res.status(500).json({ error: error.message });
  }
};

exports.updateComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }
  const { talkPageId, topicId, commentId } = req.params;
  try {
    const talkPage = await TalkPage.findById(talkPageId);
    const topic = talkPage.discussions.id(topicId);
    const comment = topic.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    if (!comment.author.equals(req.user._id)) {
      return res.status(403).json({ error: 'You do not have permission to edit this comment' });
    }
    Object.assign(comment, req.body);
    await talkPage.save();

    const user = await User.findById(req.user._id);
    if (!user.contributions.comments.includes(comment._id)) {
      user.contributions.comments.push(comment._id);
      await user.save();
    }

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
    const { talkPageId, topicId, commentId } = req.params;
    try {
      const talkPage = await TalkPage.findById(talkPageId);
      const articleId = talkPage.articleId;
      const articleAuthor = await Article.findById(articleId).author;
      const topic = talkPage.discussions.id(topicId);
      const comment = topic.comments.id(commentId);

      let isAuthorized = false;

      if (req.user) {
        if ((req.user._id.equals(articleAuthor)) | (req.user._id.equals(comment.author))) {
          isAuthorized = true;
        }
      }

      if (!isAuthorized) {
        return res.status(403).json({ error: 'You do not have permission to delete this comment' });
      }

      topic.comments.id(commentId).remove();
      await talkPage.save();
      
      const user = await User.findById(req.user._id);
      const index = user.contributions.comments.indexOf(commentId);
      if (index > -1) {
        user.contributions.comments.splice(index, 1);
        await user.save();
      }

      res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};