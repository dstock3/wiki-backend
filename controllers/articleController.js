const Article = require('../model/article');
const Portal = require('../model/portal');
const TalkPage = require('../model/talk');
const { validationResult } = require('express-validator');

exports.createArticle = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { portalid, ...articleData } = req.body;

        const article = new Article(articleData);
        const validationError = article.validateSync();
        if (validationError) {
            throw validationError;
        }
        await article.save();

        const portal = await Portal.findById(portalid);
        if (portal) {
            portal.articles.push(article._id);
            await portal.save();
        } else {
            throw new Error('Portal not found');
        }

        const talkPage = {
            articleId: article._id,
            discussions: []
        };
        await TalkPage.create(talkPage);

        res.status(201).json(article);
    } catch (error) {
        console.error("Error creating article:", error);
        res.status(400).json({ message: error.message });
    }
};

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
        res.json(article);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateArticle = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { portalid, ...articleData } = req.body;
        const article = await Article.findByIdAndUpdate(req.params.articleId, articleData, { new: true });
        
        const portal = await Portal.findById(portalid);
        if (portal) {
            portal.articles.push(article._id);
            await portal.save();
        } else {
            throw new Error('Portal not found');
        }
        
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.json(article);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteArticle = async (req, res) => {
    try {
        const article = await Article.findByIdAndRemove(req.params.articleId);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.json({ message: 'Article deleted successfully' });
    } catch (error) {
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
        console.error("Error during search operation:", error);
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

exports.updateSection = async (req, res) => {
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
        section.set(req.body);
        await article.save();
        res.json(section);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

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
        res.json({ message: 'Section deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

  