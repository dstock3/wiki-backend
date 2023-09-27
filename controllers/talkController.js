const TalkPage = require('../model/talk');
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
    //find the talkpage by articleId
    const talkPage = await TalkPage.findOne({ articleId: req.params.articleId });
    if (!talkPage) {
      return res.status(404).json({ error: 'TalkPage not found' });
    }
    res.status(200).json(talkPage);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateTalkPage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }
  try {
    const updatedTalkPage = await TalkPage.findByIdAndUpdate(req.params.talkPageId, req.body, { new: true });
    if (!updatedTalkPage) {
      return res.status(404).json({ error: 'TalkPage not found' });
    }
    res.status(200).json(updatedTalkPage);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteTalkPage = async (req, res) => {
  try {
    const talkPage = await TalkPage.findByIdAndDelete(req.params.talkPageId);
    if (!talkPage) {
      return res.status(404).json({ error: 'TalkPage not found' });
    }
    res.status(204).json({ message: 'TalkPage deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createTopic = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  const talkPageId = req.params.talkPageId;
  const { topicId, topic } = req.body;

  try {
      const talkPage = await TalkPage.findById(talkPageId);
      talkPage.discussions.push({ topicId, topic });
      await talkPage.save();

      res.status(201).json({ message: "Topic created successfully!" });
  } catch (error) {
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
    const topic = talkPage.discussions.id(topicId);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    Object.assign(topic, req.body);
    await talkPage.save();
    res.status(200).json(topic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTopic = async (req, res) => {
    const { talkPageId, topicId } = req.params;
    try {
      const talkPage = await TalkPage.findById(talkPageId);
      talkPage.discussions.id(topicId).remove();
      await talkPage.save();
      res.status(200).json({ message: 'Topic deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

exports.createComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }
  const talkPageId = req.params.talkPageId;
  const topicId = req.params.topicId;
  const { username, content, date } = req.body;

  try {
      const talkPage = await TalkPage.findById(talkPageId);
      const topic = talkPage.discussions.id(topicId);
      topic.comments.push({ username, content, date });
      await talkPage.save();

      res.status(201).json({ message: "Comment added successfully!" });
  } catch (error) {
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
    Object.assign(comment, req.body);
    await talkPage.save();
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
    const { talkPageId, topicId, commentId } = req.params;
    try {
      const talkPage = await TalkPage.findById(talkPageId);
      const topic = talkPage.discussions.id(topicId);
      topic.comments.id(commentId).remove();
      await talkPage.save();
      res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};