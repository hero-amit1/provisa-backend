const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() });
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

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'JWT_SECRET not configured in environment',
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role || 'admin',
      },
      secret,
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
      error: err?.message,
    });
  }
});

router.get('/', (req, res) => {
  return res.json({
    success: true,
    message: 'Auth route is active. Use POST /api/auth/login or POST /api/auth/register.',
  });
});

router.get('/login', (req, res) => {
  return res.json({
    success: true,
    message: 'Use POST /api/auth/login with JSON { email, password } to log in.',
  });
});

router.get('/register', (req, res) => {
  return res.json({
    success: true,
    message: 'Use POST /api/auth/register with JSON { email, password, role? } to register.',
  });
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existingAdmin = await Admin.findOne({ email: normalizedEmail });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'Admin already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'admin',
    });

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'JWT_SECRET not configured in environment',
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role || 'admin',
      },
      secret,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
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
      error: err?.message,
    });
  }
});

module.exports = router;

