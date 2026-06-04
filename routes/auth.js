const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const router = express.Router();


// ==============================
// ADMIN LOGIN
// ==============================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Dev fallback: allow local development to work even if JWT_SECRET isn't set.
    // In production, this should be configured properly.
    let jwtSecret = process.env.JWT_SECRET;
    const nodeEnv = process.env.NODE_ENV || 'development';

    if (!jwtSecret) {
      if (nodeEnv === 'production') {
        return res.status(500).json({
          success: false,
          message: 'JWT_SECRET not configured in .env',
        });
      }

      jwtSecret = 'dev_jwt_secret_change_me';
      console.warn(
        '[auth] JWT_SECRET not configured in .env; using DEV fallback secret'
      );
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role || 'admin' },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role || 'admin',
      },
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;