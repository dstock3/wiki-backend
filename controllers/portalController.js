const Portal = require('../model/portal');
const { validationResult } = require('express-validator');

exports.getAllPortals = async (req, res) => {
    try {
        const portals = await Portal.find();
        res.status(200).json(portals);
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
        }
        ).slice(0, 3);
        portal.recentUpdates = recentUpdates;

        res.status(200).json(portal);
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const portalExists = await Portal.findById(req.params.portalId);
        if (!portalExists) {
            return res.status(404).json({ error: 'Portal not found' });
        }

        if (!req.body.portalData) {
            console.log("Parsing error or empty data:", req.body);
            return res.status(400).json({ error: 'Invalid portal data' });
        }

        const updatedPortalData = JSON.parse(req.body.portalData);

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

        await Article.deleteMany({ _id: { $in: portal.articles } });
        await portal.remove();

        res.status(200).json({ message: 'Portal and its associated articles deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};