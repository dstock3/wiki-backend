const mongoose = require('mongoose');

// Info Schema for the content's additional information
const InfoSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    },
    header: {
        type: Boolean,
        default: false
    }
});

// Content Schema for the article's content sections
const ContentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    info: {
        title: String,
        image: {
            alt: String,
            src: {
                type: String,
                required: true
            }
        },
        info: [InfoSchema]
    }
});

// References Schema for the external references/links
const ReferenceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    }
});

const ArticleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: [ContentSchema],
    references: [ReferenceSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    }
});

ArticleSchema.index({
    'title': 'text',
    'content.title': 'text',
    'content.text': 'text'
});

module.exports = mongoose.model('Article', ArticleSchema);
