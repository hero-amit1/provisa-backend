const express = require('express');
const Service = require('../models/Service');
const router = express.Router();

// Public GET all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ order: 1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

