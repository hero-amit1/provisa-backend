const express = require('express');
const University = require('../models/University');

const router = express.Router();

// ======================================
// GET ALL UNIVERSITIES (PUBLIC)
// ======================================
router.get('/', async (req, res) => {
  try {
    const universities = await University.find()
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: universities,
    });
  } catch (err) {
    console.error('Get universities error:', err);

    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch universities',
    });
  }
});

module.exports = router;