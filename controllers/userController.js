const User = require('../model/user').User;
const MailingList = require('../model/user').MailingList;
const Portal = require('../model/portal');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const logger = require('../logger');
NAME = process.env.SESSION_NAME;

const userValidationRules = [
  check('username')
    .trim()
    .notEmpty().withMessage('Username is required.')
    .isLength({ min: 3, max: 25 }).withMessage('Username should be between 3 and 50 characters long.')
    .escape(),
  check('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email format.')
    .isLength({ max: 35 }).withMessage('Email should not exceed 35 characters.')
    .normalizeEmail(),
  check('password')
    .trim()
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password should be at least 6 characters long.')
];

exports.createUser = [
  ...userValidationRules,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessage = errors.array().map(err => err.msg).join(', ');
        return res.status(400).json({ error: errorMessage });
    }

    try {
      const existingUsername = await User.findOne({ username: req.body.username });
      if (existingUsername) {
        return res.status(400).json({ error: 'Username already exists.' });
      }

      const existingEmail = await User.findOne({ email: req.body.email });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      const user = new User({
        ...req.body,
        password: hashedPassword,
        contributions: {
            articles: [],
            topics: [],
            comments: []
        }
      });

      await user.save();

      logger.info({
        action: 'User created',
        username: user.username,
        email: user.email,
        createdDate: new Date().toISOString()
      });

      const mailingEntry = new MailingList({
        email: req.body.email
      });
      await mailingEntry.save();

      res.status(201).json({ message: 'User created successfully', user });

    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0]; 
        return res.status(400).json({ error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.` });
      }

      console.error(error); 
      res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
    }
  }
];

exports.loginUser = async (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ error: info.message });

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.status(200).json({
        message: 'Logged in successfully',
        username: user.username
      });
    });
  })(req, res, next);
};

exports.logoutUser = (req, res) => {
  req.logout(() => {
    req.session.destroy(err => {
      if(err) {
          return res.status(500).json({ error: 'Error logging out, please try again.' });
      }
      res.clearCookie(NAME); 
      res.json({ message: 'Logged out successfully' });
    });
  });
};

exports.checkAuthenticationStatus = (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({
      isAuthenticated: true,
      username: req.user.username
    });
  } else {
    res.status(200).json({ isAuthenticated: false });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }, '-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isOwnProfile = req.user && req.user.username === req.params.username;

    res.status(200).json({ user, isOwnProfile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUserValidationRules = [
  check('username')
    .optional()
    .trim()
    .notEmpty().withMessage('Username is required.')
    .isLength({ min: 3 }).withMessage('Username should be at least 3 characters long.')
    .escape(),
  check('email')
    .optional()
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email format.')
    .normalizeEmail(),
  check('password')
    .optional()
    .trim()
    .notEmpty().withMessage('Password is required when updating password.')
    .isLength({ min: 6 }).withMessage('Password should be at least 6 characters long when updating.'),
  check('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Your bio should not exceed 500 characters.')
    .escape()
];

exports.updateUser = [
  ...updateUserValidationRules,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const oldUserData = await User.findById(req.params.userId);
      if (!oldUserData) {
        return res.status(404).json({ errors: [{ msg: 'User not found' }] });
      }

      if (req.user.username !== req.body.username) {
        return res.status(403).json({ errors: [{ msg: 'You are not authorized to perform this action' }] });
      }

      if (oldUserData.username !== req.body.username) {
        logger.info(`User ${oldUserData.username} updated username to ${req.body.username}`);
      }

      if (req.body.password) {
        logger.info(`User ${oldUserData.username} updated their password`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        req.body.password = hashedPassword;
      }

      const updatedUser = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true, select: '-password' });

      if (oldUserData.email !== req.body.email) {
        logger.info(`User ${oldUserData.username} updated email from ${oldUserData.email} to ${req.body.email}`);
        await MailingList.findOneAndUpdate({ email: oldUserData.email }, { email: req.body.email });
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
        return res.status(400).json({ errors: [{ msg: 'Updated email already exists in the mailing list.' }] });
      }
      res.status(500).json({ errors: [{ msg: `Error code: ${error.code}. Message: ${error.message}` }] });
    }
  }
];

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await MailingList.findOneAndDelete({ email: user.email });

    await User.findByIdAndDelete(req.params.userId);

    logger.info({
      action: 'User deleted',
      username: user.username,
      email: user.email,
      deletedDate: new Date().toISOString()
    });

    res.status(204).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


