const mongoose = require('mongoose');

// Contribution Schema for storing user's contributions
const ContributionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  }
});

// User Schema to store user data
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
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
  contributions: [ContributionSchema]
});

module.exports = mongoose.model('User', UserSchema);