const User = require('../model/user').User;
const MailingList = require('../model/user').MailingList;
const Portal = require('../model/portal');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
NAME = process.env.SESSION_NAME;

const userValidationRules = [
  check('username')
    .trim()
    .notEmpty().withMessage('Username is required.')
    .isLength({ min: 3 }).withMessage('Username should be at least 3 characters long.')
    .escape(),
  check('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email format.')
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

exports.updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    if (req.user.username !== req.body.username) {
      return res.status(403).json({ error: 'You are not authorized to perform this action' });
    }

    const oldUserData = await User.findById(req.params.userId);
    const oldEmail = oldUserData.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      req.body.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true, select: '-password' });

    if (oldEmail !== req.body.email) {
      await MailingList.findOneAndUpdate({ email: oldEmail }, { email: req.body.email });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(400).json({ error: 'Updated email already exists in the mailing list.' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(204).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addContribution = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    user.contributions.push(req.body);
    await user.save();
    res.status(201).json({ message: 'Contribution added', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateContribution = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const contribution = user.contributions.id(req.params.contributionId);
    Object.assign(contribution, req.body);
    await user.save();
    res.status(200).json(contribution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteContribution = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    user.contributions.id(req.params.contributionId).remove();
    await user.save();
    res.status(200).json({ message: 'Contribution deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
