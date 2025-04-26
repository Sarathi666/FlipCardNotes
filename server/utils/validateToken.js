const jwt = require('jsonwebtoken');

const validateToken = (authHeader) => {
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1]; // Assumes 'Bearer <token>'
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId; // Changed from decoded.id to decoded.userId to match token payload
  } catch (err) {
    return null;
  }
};

module.exports = validateToken;
