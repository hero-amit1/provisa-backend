const express = require('express');
const Inquiry = require('../../models/Inquiry');
const auth = require('../../middleware/auth');
const router = express.Router();

// GET ALL INQUIRIES (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = {};
    if (type) {
      query = { type };
    }

    const inquiries = await Inquiry.find(query)
      .sort({ createdAt: -1 });

    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE INQUIRY
router.delete('/:id', auth, async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }
    res.json({ success: true, message: 'Inquiry deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

