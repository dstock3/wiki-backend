const mongoose = require('mongoose');

// Comment Schema for storing individual comments
const CommentSchema = new mongoose.Schema({
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
});

// Topic Schema to store discussion topics which include a list of comments
const TopicSchema = new mongoose.Schema({
  talkPage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TalkPage',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [CommentSchema],
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
});

// TalkPage Schema to store a list of topics associated with an article
const TalkPageSchema = new mongoose.Schema({
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  discussions: [TopicSchema]
});

module.exports = {
  Comment: mongoose.model('Comment', CommentSchema),
  Topic: mongoose.model('Topic', TopicSchema),
  TalkPage: mongoose.model('TalkPage', TalkPageSchema),
};