const Article = require('../model/article');
const Portal = require('../model/portal');
const util = require('util');

exports.createArticle = async (req, res) => {
    try {
        const { portalid, ...articleData } = req.body;
        console.log("Received article data:", articleData);
        console.log(util.inspect(articleData, { depth: null, colors: true }));

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
    try {
        const article = await Article.findByIdAndUpdate(req.params.articleId, req.body, { new: true });
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
  
      const articles = await Article.find({
        $text: {
          $search: query
        }
      });
  
      res.status(200).json(articles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  