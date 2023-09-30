const { body } = require('express-validator');

const talkValidationRules = [
    body('articleId')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('ArticleId is required'),

    body('discussions')
      .isArray()
      .withMessage('Discussions must be an array'),

    body('discussions.*.username')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Username is required for each discussion'),

    body('discussions.*.content')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Content is required for each discussion'),

    body('discussions.*.date')
      .isDate()
      .withMessage('Invalid date format for discussion'),

    body('discussions.*.topic')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Topic is required for each discussion'),

    body('discussions.*.comments')
      .isArray()
      .withMessage('Comments must be an array for each discussion'),

    body('discussions.*.comments.*.username')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Username is required for each reply'),

    body('discussions.*.comments.*.content')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Content is required for each reply'),

    body('discussions.*.comments.*.date')
      .isDate()
      .withMessage('Invalid date format for reply')
];


module.exports = { talkValidationRules };
