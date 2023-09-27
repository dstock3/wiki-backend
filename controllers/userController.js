const User = require('../model/user');
const passport = require('passport');
const bcrypt = require('bcrypt');

exports.createUser = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
      ...req.body,
      password: hashedPassword
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginUser = async (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ error: info.message });
    
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.status(200).json({
        message: 'Logged in successfully'
      });
    });
  })(req, res, next);
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
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true });
    res.status(200).json(updatedUser);
  } catch (error) {
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
