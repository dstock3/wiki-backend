const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuthenticated } = require('../middlewares/auth');

router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.post('/login', userController.loginUser);
router.get('/:userId', userController.getUserById);
router.get('/username/:username', userController.getUserByUsername);
router.put('/:userId', ensureAuthenticated, userController.updateUser);
router.delete('/:userId', ensureAuthenticated, userController.deleteUser);

router.post('/:userId/contributions', ensureAuthenticated, userController.addContribution);
router.put('/:userId/contributions/:contributionId', ensureAuthenticated, userController.updateContribution);
router.delete('/:userId/contributions/:contributionId', ensureAuthenticated, userController.deleteContribution);

module.exports = router;
