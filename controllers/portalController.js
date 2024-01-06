const Portal = require('../model/portal');
const Article = require('../model/article');
const { check, validationResult } = require('express-validator');
const logger = require('../logger');

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

        const featuredArticleId = portal.articles[Math.floor(Math.random() * portal.articles.length)];
        const featuredArticle = await Article.findById(featuredArticleId);
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
        const portal = await Portal.findById(req.params.portalId).populate('articles', '_id title');
        if (!portal) {
            return res.status(404).json({ message: 'Portal not found' });
        }
        res.json(portal.articles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const portalValidationRules = [
    check('portalTitle')
      .trim()
      .notEmpty().withMessage('Portal title is required.')
      .isLength({ min: 3, max: 100 }).withMessage('Portal title should be between 3 and 100 characters.'),
    check('portalDescription')
      .trim()
      .notEmpty().withMessage('Portal description is required.')
      .isLength({ max: 500 }).withMessage('Portal description should not exceed 500 characters.'),
      check('portalImage.src')
      .if((value, { req }) => req.body.portalImage && req.body.portalImage.src)
      .matches(/^data:image\/[a-zA-Z]+;base64,/).withMessage('Portal image source should be a valid Base64 encoded image.'),
    check('portalImage.alt')
      .if((value, { req }) => req.body.portalImage && req.body.portalImage.alt)
      .isLength({ max: 100 }).withMessage('Image alt text should not exceed 100 characters.')
];
  
exports.createPortal = [
    ...portalValidationRules,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          const errorMessage = errors.array().map(err => err.msg).join(', ');
          return res.status(400).json({ error: errorMessage });
      }
  
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

        logger.info({
            action: 'Portal created',
            portalId: portal._id,
            portalTitle: portal.portalTitle,
            ownerId: owner,
            createdDate: new Date().toISOString()
        });

        res.status(201).json(portal);
      } catch (err) {
        logger.error({
            action: 'Error creating portal',
            errorMessage: err.message,
            portalTitle: req.body.portalTitle,
            userId: req.user ? req.user._id : null
        });

        res.status(500).json({ error: err.message });
      }
    }
];

exports.updatePortal = [
    ...portalValidationRules,
    async (req, res) => {
        try {
            const portalExists = await Portal.findById(req.params.portalId);

            if (!portalExists) {
                return res.status(404).json({ error: 'Portal not found' });
            }

            const isViewerOwner = req.user && portalExists.owner.equals(req.user._id);
            const isViewerAdmin = req.user && req.user.isAdmin;

            if (!isViewerOwner && !isViewerAdmin) {
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

            logger.info({
                action: 'Portal updated',
                portalId: portal._id,
                updatedFields: Object.keys(updatedPortalData),
                updatedDate: new Date().toISOString(),
                userId: req.user._id
            });

            res.status(200).json(portal);
        } catch (err) {
            logger.error({
                action: 'Error updating portal',
                errorMessage: err.message,
                portalId: req.params.portalId,
                userId: req.user ? req.user._id : null
            });

            console.error("Error:", err.message, err.stack);
            res.status(500).json({ error: err.message });
        }
    }
];

exports.deletePortal = async (req, res) => {
    try {
        const portal = await Portal.findById(req.params.portalId);
        if (!portal) {
            return res.status(404).json({ error: 'Portal not found' });
        }
        
        const isViewerOwner = req.user && portal.owner.equals(req.user._id);
        const isViewerAdmin = req.user && req.user.isAdmin;
        
        if (!isViewerOwner && !isViewerAdmin) {
            return res.status(403).json({ error: 'You do not have permission to delete this portal' });
        }
        
        await Article.deleteMany({ _id: { $in: portal.articles } });
        
        logger.info({
            action: 'Associated articles deleted',
            portalId: portal._id,
            articlesIds: portal.articles,
            deletedDate: new Date().toISOString(),
            userId: req.user._id
        });

        await Portal.deleteOne({ _id: req.params.portalId });

        logger.info({
            action: 'Portal deleted',
            portalId: portal._id,
            deletedDate: new Date().toISOString(),
            userId: req.user._id
        });

        res.status(200).json({ message: 'Portal and its associated articles deleted successfully' });
    } catch (err) {
        logger.error({
            action: 'Error deleting portal',
            errorMessage: err.message,
            portalId: req.params.portalId,
            userId: req.user ? req.user._id : null
        });
        
        res.status(500).json({ error: err.message });
    }
};