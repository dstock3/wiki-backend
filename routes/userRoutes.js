const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:userId', userController.getUserById);
router.put('/:userId', userController.updateUser);
router.delete('/:userId', userController.deleteUser);

router.post('/:userId/contributions', userController.addContribution);
router.put('/:userId/contributions/:contributionId', userController.updateContribution);
router.delete('/:userId/contributions/:contributionId', userController.deleteContribution);

module.exports = router;
