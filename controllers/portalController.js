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
        res.status(200).json(portal);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createPortal = async (req, res) => {
    /*
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }*/
    console.log(req.body)
    try {
        const portal = new Portal(req.body);
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

        const updatedPortalData = JSON.parse(req.body.portalData);
        if(!updatedPortalData) {
            console.log("Parsing error or empty data:", req.body);
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
        const portal = await Portal.findByIdAndRemove(req.params.portalId);
        if (!portal) {
            return res.status(404).json({ error: 'Portal not found' });
        }
        res.status(200).json({ message: 'Portal deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
