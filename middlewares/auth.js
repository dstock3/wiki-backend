const logger = require('../logger');

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    logger.info(`Unauthorized access attempt from ${req.ip}: ${req.method} ${req.originalUrl}`);
    res.status(401).json({ error: 'Unauthorized' });
}

function ensureAdmin(req, res, next) {
    if (req.user && req.user.isAdmin) {
        logger.info(`Admin access granted to user ${req.user.username}: ${req.method} ${req.originalUrl}`);
        return next();
    }
    logger.warn(`Admin access denied to user ${req.user ? req.user.username : 'unknown'} from IP ${req.ip}: ${req.method} ${req.originalUrl}`);
    res.status(401).json({ error: 'Access denied. Admin privileges required.' });
}
  
module.exports = {
    ensureAuthenticated,
    ensureAdmin
};