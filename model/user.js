const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
    maxlength: 25,
    match: /^[a-zA-Z0-9]+$/ 
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
  contributions: ContributionSchema,
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isBanned: {
    type: Boolean,
    default: false
  }
});

const MailingListSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  }
});

UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

UserSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = {
  User: mongoose.model('User', UserSchema),
  MailingList: mongoose.model('MailingList', MailingListSchema),
};