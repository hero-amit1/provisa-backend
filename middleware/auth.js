const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers?.authorization;

    // ==============================
    // CHECK HEADER
    // ==============================
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // ==============================
    // CHECK FORMAT
    // ==============================
    if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format. Use Bearer token.',
      });
    }

    // ==============================
    // EXTRACT TOKEN
    // ==============================
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token missing.',
      });
    }

    // ==============================
    // CHECK JWT SECRET
    // ==============================
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error('❌ JWT_SECRET is missing in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error.',
      });
    }

    // ==============================
    // VERIFY TOKEN
    // ==============================
    const decoded = jwt.verify(token, secret);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }

    // ==============================
    // ATTACH USER
    // ==============================
    req.user = decoded;

    next();
  } catch (err) {
    console.error('❌ Auth middleware error:', err.message);

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

module.exports = auth;