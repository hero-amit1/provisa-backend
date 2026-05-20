const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Temp in-memory admin (replace with DB later)
const adminUser = {
  email: 'admin@provisa.com',
  password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // "password"
};


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

    if (email !== adminUser.email) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await bcrypt.compare(password, adminUser.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'JWT_SECRET not configured in .env',
      });
    }

    const token = jwt.sign(
      { role: 'admin', email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        email,
        role: 'admin',
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