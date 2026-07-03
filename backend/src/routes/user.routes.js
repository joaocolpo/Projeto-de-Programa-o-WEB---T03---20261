const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/me', userController.getProfile);
router.put('/me', userController.updateProfile);
router.delete('/me', userController.deleteAccount);

module.exports = router;
