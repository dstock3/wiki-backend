const { body } = require('express-validator');

const articleValidationRules = [
    body('title').isString().trim().notEmpty().withMessage('Title is required.'),
    body('content').isArray().withMessage('Content should be an array.'),
    body('content.*.title').isString().trim().notEmpty().withMessage('Each content item should have a title.'),
    body('content.*.text').isString().trim().notEmpty().withMessage('Each content item should have text.'),
    body('dateCreated').optional().isDate().withMessage('Invalid date format.'),
    body('lastEdited').optional().isDate().withMessage('Invalid date format.'),
    body('portalid').isString().trim().notEmpty().withMessage('Portal ID is required.'),
];

module.exports = {articleValidationRules};
