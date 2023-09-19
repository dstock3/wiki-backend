const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuthenticated } = require('../middlewares/auth');

router.post('/', userController.createUser);
router.get('/', ensureAuthenticated, userController.getAllUsers);
router.get('/:userId', ensureAuthenticated, userController.getUserById);
router.get('/username/:username', ensureAuthenticated, userController.getUserByUsername);
router.put('/:userId', ensureAuthenticated, userController.updateUser);
router.delete('/:userId', ensureAuthenticated, userController.deleteUser);

router.post('/:userId/contributions', ensureAuthenticated, userController.addContribution);
router.put('/:userId/contributions/:contributionId', ensureAuthenticated, userController.updateContribution);
router.delete('/:userId/contributions/:contributionId', ensureAuthenticated, userController.deleteContribution);

module.exports = router;
