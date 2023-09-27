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

    body('discussions.*.replies')
      .isArray()
      .withMessage('Replies must be an array for each discussion'),

    body('discussions.*.replies.*.username')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Username is required for each reply'),

    body('discussions.*.replies.*.content')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Content is required for each reply'),

    body('discussions.*.replies.*.date')
      .isDate()
      .withMessage('Invalid date format for reply')
];


module.exports = { talkValidationRules };
