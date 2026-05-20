const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.header('Authorization');

    // Check if header exists
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Validate Bearer format
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format.',
      });
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token is missing.',
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallbacksecret'
    );

    // Attach user to request
    req.user = decoded;

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

module.exports = auth;