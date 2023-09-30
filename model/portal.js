const mongoose = require('mongoose');

const PortalSchema = new mongoose.Schema({
  portalTitle: {
    type: String,
    required: true
  },
  portalDescription: {
    type: String,
    required: true
  },
  portalImage: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    }
  },
  articles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article'
    }
  ],
  featuredArticle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  },
  recentUpdates: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article'
    }
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Portal', PortalSchema);