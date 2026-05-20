const express = require('express');
const Settings = require('../models/Settings.cjs');

const router = express.Router();

// ======================================
// GET PUBLIC SETTINGS
// Used by frontend footer/contact pages
// ======================================
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.getSingleton();

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found',
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (err) {
    console.error('Get public settings error:', err);

    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch settings',
    });
  }
});

module.exports = router;