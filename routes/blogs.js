const express = require('express');
const Blog = require('../models/Blog');

const router = express.Router();

// =============================
// GET ALL BLOGS (PUBLIC)
// =============================
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    res.status(200).json(blogs);
  } catch (err) {
    console.error('Get blogs error:', err);

    res.status(500).json({
      error: 'Failed to fetch blogs',
      message: err.message,
    });
  }
});

// =============================
// GET BLOG BY SLUG (PUBLIC)
// =============================
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug }).lean();

    if (!blog) {
      return res.status(404).json({
        error: 'Blog not found',
      });
    }

    res.status(200).json(blog);
  } catch (err) {
    console.error('Get blog by slug error:', err);

    res.status(500).json({
      error: 'Failed to fetch blog',
      message: err.message,
    });
  }
});

module.exports = router;