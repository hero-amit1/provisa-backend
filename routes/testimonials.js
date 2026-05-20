const express = require('express');
const Testimonial = require('../models/Testimonial');

const router = express.Router();

// ======================================
// GET ALL TESTIMONIALS (PUBLIC)
// ======================================
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    res.status(200).json({
      success: true,
      data: testimonials,
    });
  } catch (err) {
    console.error('Get testimonials error:', err);

    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch testimonials',
    });
  }
});

module.exports = router;