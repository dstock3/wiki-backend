const { body } = require('express-validator');
/*
const portalValidationRules = [
  body('portalTitle')
    .trim()
    .exists().withMessage('Portal title is required')
    .isLength({ min: 3 })
    .withMessage('Portal title must be at least 3 characters long')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Portal title can only contain letters and spaces'),

  body('portalDescription')
    .trim()
    .exists().withMessage('Portal description is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters long'),

  body('portalImage.src')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image source must be a valid URL'),

  body('portalImage.alt')
    .optional()
    .trim()
    .isString()
    .withMessage('Image alt text must be a string'),

  body('articles.*')
    .optional()
    .isMongoId()
    .withMessage('Each article ID must be a valid MongoDB ObjectId'),

  body('featuredArticle')
    .optional()
    .isMongoId()
    .withMessage('Featured article ID must be a valid MongoDB ObjectId'),

  body('recentUpdates.*')
    .optional()
    .isMongoId()
    .withMessage('Each recent update article ID must be a valid MongoDB ObjectId'),

];

*/

const portalValidationRules = [
  body('portalTitle')
    .trim()
    .exists().withMessage('Portal title is required')
    .isLength({ min: 3 })
    .withMessage('Portal title must be at least 3 characters long'),
  
  body('portalDescription')
    .trim()
    .exists().withMessage('Portal description is required')
    .isLength({ min: 10, max: 1500 })
    .withMessage('Description must be between 10 and 1500 characters long'),
];

module.exports = { portalValidationRules };