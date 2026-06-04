const express = require('express');
const Team = require('../models/Team');

const router = express.Router();

// ======================================
// GET ALL TEAM MEMBERS (PUBLIC)
// ======================================
router.get('/', async (req, res) => {
  try {
    const team = await Team.find()
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: team,
    });
  } catch (err) {
    console.error('Get team members error:', err);

    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch team members',
    });
  }
});

module.exports = router;