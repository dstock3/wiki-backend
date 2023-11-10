const Article = require('../model/article');
const Portal = require('../model/portal');
const User = require('../model/user').User;
const TalkPage = require('../model/talk').TalkPage;
const { check, validationResult } = require('express-validator');
const sanitizeContent = require('../util/sanitize');
const logger = require('../logger');

const articleValidationRules = [
    check('title').trim().notEmpty().withMessage('Title is required.'),
    check('intro').trim().notEmpty().withMessage('Intro is required.'),
    
    check('content.*.title').trim().notEmpty().withMessage('Content title is required.'),
    check('content.*.text').trim().notEmpty().withMessage('Content text is required.'),

    check('infoBox.title').trim().notEmpty().withMessage('InfoBox title is required.'),

    check('infoBox.image.src')
      .if((value, { req }) => req.body.infoBox.image && req.body.infoBox.image.src)
      .matches(/^data:image\/[a-zA-Z]+;base64,/).withMessage('Article image source should be a valid Base64 encoded image.'),
    
    check('infoBox.info.*.label').trim().notEmpty().withMessage('InfoBox label is required.'),

    check('references.*.name').trim().notEmpty().withMessage('Reference name is required.'),
    check('references.*.link').isURL().withMessage('Reference link should be a valid URL.'),

    check('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid article status.')
];

exports.createArticle = [
    async (req, res, next) => {
        req.body.content = JSON.parse(req.body.content);
        req.body.infoBox = JSON.parse(req.body.infoBox);
        req.body.references = JSON.parse(req.body.references);

        req.body.content.forEach(contentItem => {
            if (contentItem.text) {
                contentItem.text = sanitizeContent(contentItem.text);
            }
        });

        next();
    },
    ...articleValidationRules,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessage = errors.array().map(err => err.msg).join(', ');

            logger.warn({
                action: 'Validation failed for creating article',
                errorMessage: errorMessage,
                requestPayload: req.body,
                userId: req.user ? req.user._id : null
            });
            
            return res.status(400).json({ error: errorMessage });
        }
        
        const portalid = req.body.portalid;

        try {
            const article = new Article(req.body);
            article.author = req.user._id;
            
            const talkPage = new TalkPage({
                articleId: article._id,
                discussions: []
            });
            await talkPage.save();
            article.talk = talkPage._id;
            
            await article.save();

            const portal = await Portal.findById(portalid);
            if (portal) {
                portal.articles.push(article._id);
                await portal.save();

                logger.info({
                    action: 'Article created',
                    articleId: article._id,
                    portalId: portalid,
                    userId: req.user._id,
                    createdDate: new Date().toISOString()
                });
            } else {
                throw new Error('Portal not found');
            }

            const user = await User.findById(req.user._id);
            user.contributions.articles.push(article._id);
            await user.save();
            
            res.status(201).json(article);
        } catch (error) {
            logger.error({
                action: 'Error creating article',
                errorMessage: error.message,
                portalId: portalid,
                requestPayload: req.body,
                userId: req.user ? req.user._id : null
            });

            res.status(400).json({ message: error.message });
        }
    }
];

exports.getAllArticles = async (req, res) => {
    try {
        const articles = await Article.find();
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getArticleById = async (req, res) => {
    try {
        const article = await Article.findById(req.params.articleId);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        const isAuthor = req.user ? req.user._id.equals(article.author) : false;
        res.status(200).json({ article, isAuthor });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateArticle = [
    async (req, res, next) => {
        req.body.content = JSON.parse(req.body.content);
        req.body.infoBox = JSON.parse(req.body.infoBox);
        req.body.references = JSON.parse(req.body.references);

        req.body.content.forEach(contentItem => {
            if (contentItem.text) {
                contentItem.text = sanitizeContent(contentItem.text);
            }
        });
        next();
    },
    ...articleValidationRules,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessage = errors.array().map(err => err.msg).join(', ');

            logger.warn({
                action: 'Validation failed for updating article',
                errorMessage: errorMessage,
                requestPayload: req.body,
                userId: req.user ? req.user._id : null
            });
            
            return res.status(400).json({ error: errorMessage });
        }
        try {
            const article = await Article.findByIdAndUpdate(req.params.articleId, req.body, { new: true });

            logger.info({
                action: 'Article updated',
                articleId: article._id,
                userId: req.user._id,
                updatedDate: new Date().toISOString(),
                updatedFields: Object.keys(req.body)
            });

            if (!article) {
                return res.status(404).json({ message: 'Article not found' });
            }

            const user = await User.findById(req.user._id);

            if (!user.contributions.articles.includes(article._id)) {
                user.contributions.articles.push(article._id);
                await user.save();
            }

            res.json(article);
        } catch (error) {
            logger.error({
                action: 'Error updating article',
                errorMessage: error.message,
                articleId: req.params.articleId,
                requestPayload: req.body,
                userId: req.user ? req.user._id : null
            });

            res.status(400).json({ message: error.message });
        }
    }
];

exports.deleteArticle = async (req, res) => {
    try {
        const article = await Article.findByIdAndRemove(req.params.articleId);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        await User.updateMany(
            { "contributions.articles": req.params.articleId },
            { $pull: { "contributions.articles": req.params.articleId } }
        );

        const talkPage = await TalkPage.findOne({ articleId: req.params.articleId });
        if (talkPage) {
            await talkPage.remove();
        }

        logger.info({
            action: 'Article deleted',
            articleId: req.params.articleId,
            deletedBy: req.user ? req.user._id : null,
            deletedDate: new Date().toISOString()
        });

        res.json({ message: 'Article deleted successfully' });
    } catch (error) {
        logger.error({
            action: 'Error deleting article',
            errorMessage: error.message,
            articleId: req.params.articleId,
            userId: req.user ? req.user._id : null
        });

        res.status(500).json({ message: error.message });
    }
};

exports.searchArticles = async (req, res) => {
    try {
        const query = req.query.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10; 

        const skip = (page - 1) * limit;

        const totalArticles = await Article.countDocuments({
            $text: {
                $search: query
            }
        });

        const articles = await Article.find({
            $text: {
                $search: query
            }
        }).skip(skip).limit(limit);

        const totalPages = Math.ceil(totalArticles / limit);

        res.status(200).json({
            articles: articles,
            total: totalArticles,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.getSection = async (req, res) => {
    try {
        const article = await Article.findById(req.params.articleId);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        const section = article.content.id(req.params.sectionId);
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }
        res.json(section);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const sectionValidationRules = [
    check('title').trim().notEmpty().withMessage('Section title is required.'),
    check('text').trim().notEmpty().withMessage('Section text is required.'),
    
    check('image.src')
      .if((value, { req }) => req.body.image && req.body.image.src)
      .matches(/^data:image\/[a-zA-Z]+;base64,|[a-zA-Z]+:\/\/.+/)
      .withMessage('Section image source should be a valid URL or a Base64 encoded image.'),

    check('image.alt').optional().trim().isLength({ max: 100 }).withMessage('Image alt text should not exceed 100 characters.')
];

exports.updateSection = [
    ...sectionValidationRules,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const article = await Article.findById(req.params.articleId);
            if (!article) {
                return res.status(404).json({ message: 'Article not found' });
            }
            const section = article.content.id(req.params.sectionId);
            if (!section) {
                return res.status(404).json({ message: 'Section not found' });
            }
            req.body.text = sanitizeContent(req.body.text);
            console.log(req.body);
            section.set(req.body);
            await article.save();

            logger.info({
                action: 'Section updated',
                articleId: req.params.articleId,
                sectionId: req.params.sectionId,
                updatedBy: req.user ? req.user._id : null,
                updatedDate: new Date().toISOString()
            });

            res.json(section);
        } catch (error) {
            logger.error({
                action: 'Error updating section',
                errorMessage: error.message,
                articleId: req.params.articleId,
                sectionId: req.params.sectionId,
                userId: req.user ? req.user._id : null
            });

            res.status(500).json({ message: error.message });
        }
    }
];

exports.deleteSection = async (req, res) => {
    try {
        const article = await Article.findById(req.params.articleId);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        const section = article.content.id(req.params.sectionId);
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }
        section.remove();
        await article.save();

        logger.info({
            action: 'Section deleted',
            articleId: req.params.articleId,
            sectionId: req.params.sectionId,
            deletedBy: req.user ? req.user._id : null,
            deletedDate: new Date().toISOString()
        });

        res.json({ message: 'Section deleted successfully' });
    } catch (error) {
        logger.error({
            action: 'Error deleting section',
            errorMessage: error.message,
            articleId: req.params.articleId,
            sectionId: req.params.sectionId,
            userId: req.user ? req.user._id : null
        });

        res.status(500).json({ message: error.message });
    }
}



  