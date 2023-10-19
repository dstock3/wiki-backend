const mongoose = require('mongoose');

// Comment Schema for storing individual comments
const CommentSchema = new mongoose.Schema({
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
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
    required: true
  }
});

// Topic Schema to store discussion topics which include a list of comments
const TopicSchema = new mongoose.Schema({
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [CommentSchema]
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