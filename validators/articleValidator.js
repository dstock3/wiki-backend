const { body } = require('express-validator');

const articleValidationRules = [
    body('title').isString().trim().notEmpty().withMessage('Title is required.'),
    body('content').isString().trim().notEmpty().withMessage('Content is required.'),
    body('dateCreated').optional().isDate().withMessage('Invalid date format.'),
    body('lastEdited').optional().isDate().withMessage('Invalid date format.'),
    body('portalid').isString().trim().notEmpty().withMessage('Portal ID is required.'),
];

module.exports = {articleValidationRules};
