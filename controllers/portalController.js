const Portal = require('../model/portal');

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
        res.status(200).json(portal);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createPortal = async (req, res) => {
    try {
        const portal = new Portal(req.body);
        await portal.save();
        res.status(201).json(portal);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updatePortal = async (req, res) => {
    try {
        const portal = await Portal.findByIdAndUpdate(req.params.portalId, req.body, { new: true });
        if (!portal) {
            return res.status(404).json({ error: 'Portal not found' });
        }
        res.status(200).json(portal);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deletePortal = async (req, res) => {
    try {
        const portal = await Portal.findByIdAndRemove(req.params.portalId);
        if (!portal) {
            return res.status(404).json({ error: 'Portal not found' });
        }
        res.status(200).json({ message: 'Portal deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
