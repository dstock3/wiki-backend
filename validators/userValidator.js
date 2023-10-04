const { body } = require('express-validator');

const userValidationRules = [
    body('username')
      .trim()
      .isLength({ min: 5 })
      .withMessage('Username must be at least 5 characters long')
      .isAlphanumeric()
      .withMessage('Username can only contain letters and numbers'),

    body('email')
      .trim()
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),

    body('password')
      .if((value, { req }) => req.body.password && req.body.password.length > 0)
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

    body('dateJoined')
      .optional()
      .isDate()
      .withMessage('Invalid date format')
];

module.exports = { userValidationRules };