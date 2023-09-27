const { body } = require('express-validator');

const portalValidationRules = [
    body('name')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Name must be at least 3 characters long')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),

    body('description')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Description must be between 10 and 500 characters long'),

    body('articles')
      .optional()
      .isArray()
      .withMessage('Articles must be an array of article IDs'),

    body('owner')
      .optional()
      .isString()
      .trim()
      .withMessage('Owner must be a valid user ID'),

    body('dateCreated')
      .optional()
      .isDate()
      .withMessage('Invalid date format'),

    body('url')
      .optional()
      .trim()
      .isURL()
      .withMessage('URL must be a valid URL'),

    body('image')
      .optional()
      .trim()
      .isURL()
      .withMessage('Image must be a valid URL')
];


module.exports = { portalValidationRules };