const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware'); // ✅ JWT Auth middleware
const User = require('../models/User'); // ✅ Mongoose model

// Register and login routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Delete account route
app.delete('/api/auth/delete', async (req, res) => {
    try {
      // Validate token and get user ID
      const userId = validateToken(req.headers.authorization);  // Your token validation logic
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      // Perform deletion logic
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
