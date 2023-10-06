module.exports = (req, res, next) => {
    if (req.body.content && typeof req.body.content === 'string') {
        req.body.content = JSON.parse(req.body.content);
    }
    if (req.body.infoBox && typeof req.body.infoBox === 'string') {
        req.body.infoBox = JSON.parse(req.body.infoBox);
    }
    if (req.body.references && typeof req.body.references === 'string') {
        req.body.references = JSON.parse(req.body.references);
    }
    next();
};