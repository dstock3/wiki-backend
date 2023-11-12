function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
}

function ensureAdmin(req, res, next) {
    if (req.user && req.user.isAdmin) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
}
  
module.exports = {
    ensureAuthenticated,
    ensureAdmin
};