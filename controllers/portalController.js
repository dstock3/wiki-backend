const Portal = require('../model/portal');
const Article = require('../model/article');

exports.getAllPortals = async (req, res) => {
    try {
        const portals = await Portal.find();

        isLoggedIn = req.user ? true : false;

        res.status(200).json({ portals, isLoggedIn });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPortalById = async (req, res) => {
    try {
        const portal = await Portal.findById(req.params.portalId).populate('articles featuredArticle recentUpdates');
        if (!portal) {
            return res.status(404).json({ error: 'Portal not found' });
        }

        const featuredArticle = portal.articles[Math.floor(Math.random() * portal.articles.length)];
        portal.featuredArticle = featuredArticle;

        const recentUpdates = portal.articles.sort((a, b) => {
            return b.datePublished - a.datePublished;
        }).slice(0, 3);
        portal.recentUpdates = recentUpdates;

        const isViewerOwner = req.user && portal.owner.equals(req.user._id);
        portal.isViewerOwner = isViewerOwner;

        res.status(200).json({ portal, isViewerOwner });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getArticlesByPortalId = async (req, res) => {
    try {
        const portal = await Portal.findById(req.params.portalId).populate('articles');
        if (!portal) {
            return res.status(404).json({ message: 'Portal not found' });
        }
        res.json(portal.articles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createPortal = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'You need to be logged in to create a portal' });
    }

    try {
        if (req.file) {
            req.body.portalImage.src = req.file.path;
        }
        const owner = req.user._id;

        const portal = new Portal({
            portalTitle: req.body.portalTitle,
            portalDescription: req.body.portalDescription,
            portalImage: req.body.portalImage,
            owner: owner
        });
        await portal.save();
        res.status(201).json(portal);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updatePortal = async (req, res) => {
    try {
        const portalExists = await Portal.findById(req.params.portalId);

        if (!portalExists) {
            return res.status(404).json({ error: 'Portal not found' });
        }

        const isViewerOwner = req.user && portalExists.owner.equals(req.user._id);
        if (!isViewerOwner) {
            return res.status(403).json({ error: 'You do not have permission to update this portal' });
        }

        const updatedPortalData = {
            portalTitle: req.body.portalTitle,
            portalDescription: req.body.portalDescription,
            portalImage: req.body.portalImage
        };

        if (req.file) {
            updatedPortalData.portalImage.src = req.file.path;
        }

        const portal = await Portal.findByIdAndUpdate(req.params.portalId, updatedPortalData, { new: true });

        res.status(200).json(portal);
    } catch (err) {
        console.error("Error:", err.message, err.stack);
        res.status(500).json({ error: err.message });
    }
};

exports.deletePortal = async (req, res) => {
    try {
        const portal = await Portal.findById(req.params.portalId);
        if (!portal) {
            return res.status(404).json({ error: 'Portal not found' });
        }
        
        const isViewerOwner = req.user && portal.owner.equals(req.user._id);
        if (!isViewerOwner) {
            return res.status(403).json({ error: 'You do not have permission to delete this portal' });
        }
        
        await Article.deleteMany({ _id: { $in: portal.articles } });
        await Portal.deleteOne({ _id: req.params.portalId });

        res.status(200).json({ message: 'Portal and its associated articles deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};