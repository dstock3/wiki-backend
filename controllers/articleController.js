const Article = require('../model/article');
const Portal = require('../model/portal');
const User = require('../model/user').User;
const TalkPage = require('../model/talk').TalkPage;

exports.createArticle = async (req, res) => {
    const portalid = req.body.portalid;
    req.body.content = JSON.parse(req.body.content);
    req.body.infoBox = JSON.parse(req.body.infoBox);
    req.body.references = JSON.parse(req.body.references);

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
        } else {
            throw new Error('Portal not found');
        }

        const user = await User.findById(req.user._id);
        user.contributions.articles.push(article._id);
        await user.save();
        
        res.status(201).json(article);
    } catch (error) {
        console.error("Error Stack Trace:", error.stack);
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
        const isAuthor = req.user ? req.user._id.equals(article.author) : false;
        res.status(200).json({ article, isAuthor });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateArticle = async (req, res) => {
    req.body.content = JSON.parse(req.body.content);
    req.body.infoBox = JSON.parse(req.body.infoBox);
    req.body.references = JSON.parse(req.body.references);

    try {
        const article = await Article.findByIdAndUpdate(req.params.articleId, req.body, { new: true });

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
        console.error("Error in updateArticle:", error);
        res.status(400).json({ message: error.message });
    }
};

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

  