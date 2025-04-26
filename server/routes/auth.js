const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');
const User = require('../models/User');

// Register and login routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Token verification route
router.get('/verify', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Token is valid' });
});

// Delete account route with authentication
router.delete('/delete', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const result = await User.deleteOne({ _id: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error during account deletion:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
