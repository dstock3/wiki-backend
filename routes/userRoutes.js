const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuthenticated, ensureAdmin } = require('../middlewares/auth');
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

// User Routes
router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.post('/login', userController.loginUser);
router.post('/logout', userController.logoutUser);
router.get('/status', userController.checkAuthenticationStatus);

// Admin Routes
router.put('/admin/ban/:userId', ensureAuthenticated, ensureAdmin, csrfProtection, userController.adminBanUser);
router.put('/admin/unban/:userId', ensureAuthenticated, ensureAdmin, csrfProtection, userController.adminUnbanUser);
router.delete('/admin/:userId', ensureAuthenticated, ensureAdmin, csrfProtection, userController.adminDeleteUser);
router.get('/admin/manage', ensureAuthenticated, ensureAdmin, userController.adminGetUsers);
router.get('/admin', ensureAuthenticated, userController.checkAdmin);

// Parameterized User Routes
router.get('/:userId', userController.getUserById);
router.get('/username/:username', userController.getUserByUsername);
router.put('/:userId', ensureAuthenticated, csrfProtection, userController.updateUser);
router.delete('/:userId', ensureAuthenticated, csrfProtection, userController.deleteUser);

module.exports = router;
