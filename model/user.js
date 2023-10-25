const mongoose = require('mongoose');

// Contribution Schema for storing user's contributions
const ContributionSchema = new mongoose.Schema({
  articles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  topics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
});

// User Schema to store user data
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    maxlength: 25
  },
  email: {
    type: String,
    unique: true,
    required: true,
    maxlength: 35
  },
  password: {
    type: String,
    required: true
  },
  joinedDate: {
    type: Date,
    default: Date.now
  },
  bio: {
    type: String,
    default: ''
  },
  contributions: ContributionSchema
});

const MailingListSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  }
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  MailingList: mongoose.model('MailingList', MailingListSchema),
};