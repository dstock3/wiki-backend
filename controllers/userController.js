const User = require('../model/user').User;
const MailingList = require('../model/user').MailingList;
const Portal = require('../model/portal');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const logger = require('../logger');
require('dotenv').config();
NAME = process.env.SESSION_NAME;
const sanitize = require('../util/sanitize');
const nodemailer = require('nodemailer');

const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5;
const LOCK_TIME = parseInt(process.env.LOCK_TIME, 10) || 2 * 60 * 60 * 1000; 

const userValidationRules = [
  check('username')
    .trim()
    .notEmpty().withMessage('Username is required.')
    .isLength({ min: 3, max: 25 }).withMessage('Username should be between 3 and 25 characters long.')
    .matches(/^[a-zA-Z0-9]+$/).withMessage('Username can only contain alphanumeric characters.')
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
      logger.error({
        action: 'Error creating user',
        errorMessage: error.message
      });
      
      res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
    }
  }
];

exports.loginUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.isLocked) {
      return res.status(403).json({ error: "Account is temporarily locked" });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'Your account has been banned.' });
    }

    const isMatch = await user.comparePassword(req.body.password);

    if (isMatch) {
      if (user.failedLoginAttempts !== 0 || user.lockUntil !== null) {
        user.failedLoginAttempts = 0;
        user.lockUntil = null;
        await user.save();
      }
    } else {
      user.failedLoginAttempts += 1;
      
      if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME);
      }
      
      await user.save();
      return res.status(401).json({ error: "Invalid credentials" });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.status(200).json({
        message: 'Logged in successfully',
        username: user.username
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during the login process' });
  }
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
    const user = await User.findOne({ username: req.params.username }, '-password')
      .populate('contributions.articles', 'title')
      .populate('contributions.topics')
      .populate('contributions.comments');

    if (!user) return res.status(404).json({ error: 'User not found' });

    const isOwnProfile = req.user && req.user.username === req.params.username;

    res.status(200).json({
      user: {
        ...user._doc,
        contributions: {
          ...user._doc.contributions,
          articles: user.contributions.articles.map(article => ({
            _id: article._id,
            title: article.title
          }))
        }
      },
      isOwnProfile
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateUserValidationRules = [
  check('username')
    .optional()
    .trim()
    .notEmpty().withMessage('Username is required.')
    .isLength({ min: 3, max: 25 }).withMessage('Username should be between 3 and 25 characters long.')
    .matches(/^[a-zA-Z0-9]+$/).withMessage('Username can only contain alphanumeric characters.')
    .escape(),
  check('email')
    .optional()
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email format.')
    .isLength({ max: 35 }).withMessage('Email should not exceed 35 characters.')
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

      const isSelf = req.user._id.equals(oldUserData._id);
      const isAdmin = req.user.isAdmin;

      if (!isSelf && !isAdmin) {
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

      if (req.body.bio) {
        req.body.bio = sanitize(req.body.bio);
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

      logger.error({
        action: 'Error updating user',
        errorMessage: error.message,
        userId: req.params.userId
      });

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

    const isSelf = req.user._id.equals(user._id);
    const isAdmin = req.user.isAdmin;

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ error: 'You are not authorized to perform this action' });
    }

    await MailingList.findOneAndDelete({ email: user.email });

    await User.findByIdAndDelete(req.params.userId);

    logger.info({
      action: 'User deleted',
      username: user.username,
      email: user.email,
      deletedDate: new Date().toISOString(),
      performedBy: req.user._id,
      isAdmin: isAdmin
    });

    res.status(204).json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error({
      action: 'Error deleting user',
      errorMessage: error.message,
      userId: req.params.userId
    });

    res.status(500).json({ error: error.message });
  }
};

exports.checkAdmin = (req, res) => {
  if (req.user && req.user.isAdmin) {
      res.status(200).json({ isAdmin: true });
  } else {
      res.status(403).json({ isAdmin: false, error: 'Access denied' });
  }
};

exports.adminGetUsers = async (req, res) => {
  try {
      const users = await User.find().select('-password');
      res.status(200).json({ users });
  } catch (error) {
      logger.error(`Error fetching users for admin: ${error.message}`);
      res.status(500).json({ error: 'An error occurred while fetching users.' });
  }
};

exports.adminDeleteUser = async (req, res) => {
  try {
      const userId = req.params.userId;
      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({ error: 'User not found.' });
      }

      await User.deleteOne({ _id: userId });

      logger.info(`User ${user.username} deleted by admin ${req.user.username}`);

      res.status(200).json({ message: `User ${user.username} successfully deleted.` });
  } catch (error) {
      logger.error(`Admin delete user error: ${error.message}`);
      res.status(500).json({ error: 'Error deleting user. Please try again later.' });
  }
};

exports.adminBanUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    user.isBanned = true;
    await user.save();

    logger.info(`User ${user.username} has been banned by admin ${req.user.username}`);

    res.status(200).json({ message: 'User has been banned successfully.' });
  } catch (error) {
    logger.error(`Error banning user: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.adminUnbanUser = async (req, res) => {
  try {
    const userId = req.params.userId; 
    const user = await User.findById(userId); 

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    user.isBanned = false;
    await user.save(); 

    logger.info(`User ${user.username} has been unbanned by admin ${req.user.username}`);
    res.status(200).json({ message: 'User has been unbanned successfully.' });
  } catch (error) {
    logger.error(`Error unbanning user: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.adminResetPassword = async (req, res) => {
  try {
    const userId = req.params.userId; 
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).json({ error: 'A valid new password is required.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    user.password = hashedPassword;
    await user.save(); 

    logger.info(`Password for user ${user.username} has been reset by admin ${req.user.username}`);
    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    logger.error(`Error resetting password: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.sendContactMessage = async (req, res) => {
  try {
      const { name, email, subject, message } = req.body;

      let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.PASSWORD, 
          },
      });

      let mailOptions = {
        from: email,
        to: process.env.CONTACT_EMAIL,
        subject: subject,
        text: `You have received a new message from ${name}:\n\n${message}`,
    };

      let info = await transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);

      res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Error sending message' });
  }
};
