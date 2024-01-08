const mongoose = require('mongoose');

// Info Schema for the content's additional information
const InfoSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: false
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
    image: {
        src: {
            type: String
        },
        alt: {
            type: String,
            default: ''
        },
        align: {
            type: String,
            enum: ['left', 'right'],
            default: 'left'
        }
    },
});

const InfoBoxSchema = new mongoose.Schema({
    title: String,
    image: {
        src: {
            type: String
        },
        alt: {
            type: String,
            default: ''
        }
    },
    info: [InfoSchema]
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
    intro: {
        type: String,
        required: true
    },
    content: [ContentSchema],
    infoBox: InfoBoxSchema,
    references: [ReferenceSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    talk: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TalkPage'
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    }
});

ArticleSchema.index({
    'title': 'text',
    'intro': 'text',
    'content.title': 'text',
    'content.text': 'text'
});

module.exports = mongoose.model('Article', ArticleSchema);
