const express = require('express');
const Testimonial = require('../../models/Testimonial');
const auth = require('../../middleware/auth');

const router = express.Router();

// =========================
// GET ALL TESTIMONIALS
// =========================
router.get('/', auth, async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: testimonials,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch testimonials',
    });
  }
});

// =========================
// CREATE TESTIMONIAL
// =========================
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      university,
      text,
      rating,
      image,
      country,
      course,
      featured,
      status,
    } = req.body;

    if (!name || !university || !text) {
      return res.status(400).json({
        success: false,
        message: 'Name, university, and text are required',
      });
    }

    const testimonial = new Testimonial({
      name: name.trim(),
      university: university.trim(),
      text: text.trim(),
      rating: Number(rating) || 5,
      image: image || '',
      country: country || '',
      course: course || '',
      featured: featured === true || featured === 'true',
      status: status || 'active',
    });

    await testimonial.save();

    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: testimonial,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to create testimonial',
    });
  }
});

// =========================
// UPDATE TESTIMONIAL
// =========================
router.put('/:id', auth, async (req, res) => {
  try {
    const updateData = {};

    if (req.body.name !== undefined) updateData.name = req.body.name.trim();
    if (req.body.university !== undefined) updateData.university = req.body.university.trim();
    if (req.body.text !== undefined) updateData.text = req.body.text.trim();
    if (req.body.rating !== undefined) updateData.rating = Number(req.body.rating);
    if (req.body.image !== undefined) updateData.image = req.body.image;
    if (req.body.country !== undefined) updateData.country = req.body.country;
    if (req.body.course !== undefined) updateData.course = req.body.course;

    if (req.body.featured !== undefined) {
      updateData.featured =
        req.body.featured === true || req.body.featured === 'true';
    }

    if (req.body.status !== undefined) updateData.status = req.body.status;

    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Testimonial updated successfully',
      data: testimonial,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to update testimonial',
    });
  }
});

// =========================
// DELETE TESTIMONIAL
// =========================
router.delete('/:id', auth, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete testimonial',
    });
  }
});

module.exports = router;