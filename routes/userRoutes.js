const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuthenticated } = require('../middlewares/auth');
const csurf = require('csurf');
const csrfProtection = csurf({ cookie: true });

router.get('/get-csrf-token', csrfProtection, (req, res) => {
    try {
        const token = req.csrfToken();
        res.json({ csrfToken: token });
    } catch (error) {
        console.error('Error generating CSRF token:', error.message);
        res.status(500).json({ error: error.message });
    }
});

router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.post('/login', userController.loginUser);
router.get('/:userId', userController.getUserById);
router.get('/username/:username', userController.getUserByUsername);
router.put('/:userId', ensureAuthenticated, csrfProtection, userController.updateUser);
router.delete('/:userId', ensureAuthenticated, csrfProtection, userController.deleteUser);

router.post('/:userId/contributions', ensureAuthenticated, csrfProtection, userController.addContribution);
router.put('/:userId/contributions/:contributionId', ensureAuthenticated, csrfProtection, userController.updateContribution);
router.delete('/:userId/contributions/:contributionId', ensureAuthenticated, csrfProtection, userController.deleteContribution);

module.exports = router;
