const express = require('express');
const Blog = require('../../models/Blog');
const auth = require('../../middleware/auth');

const slugify = require('slugify');
const multer = require('multer');

const { createCloudinaryStorage } = require('../../utils/cloudinaryStorage');
const conditionalUpload = require('../../middleware/conditionalUpload');

const router = express.Router();

// ======================================
// CLOUDINARY STORAGE
// ======================================
const storage = createCloudinaryStorage({
  folder: 'blogs',
  width: 1200,
});

// ======================================
// MULTER CONFIG
// ======================================
const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    try {
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error('Only jpg, jpeg, png, and webp images are allowed'));
      }

      cb(null, true);
    } catch (err) {
      cb(err);
    }
  },
});

const uploadMiddleware = conditionalUpload(upload.single('image'));

// ======================================
// SAFE AUTH WRAPPER (PREVENT CRASH)
// ======================================
const safeAuth = (req, res, next) => {
  try {
    return auth(req, res, next);
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

// ======================================
// GET ALL BLOGS
// ======================================
router.get('/', safeAuth, async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      data: blogs,
    });
  } catch (err) {
    console.error('Get blogs error:', err);

    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch blogs',
    });
  }
});

// ======================================
// GET SINGLE BLOG
// ======================================
router.get('/:id', safeAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).lean();

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (err) {
    console.error('Get blog error:', err);

    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch blog',
    });
  }
});

// ======================================
// CREATE BLOG
// ======================================
router.post('/', safeAuth, uploadMiddleware, async (req, res) => {
  try {
    const { title, content, excerpt, category, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
    }

    const slug = slugify(`${title}-${Date.now()}`, {
      lower: true,
      strict: true,
    });

    const imageUrl =
      req.file?.secure_url ||
      req.file?.path ||
      req.file?.url ||
      '';

    const blog = new Blog({
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt || '',
      category: category || 'General',
      status: status || 'draft',
      slug,
      image: imageUrl,
    });

    const savedBlog = await blog.save();

    return res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: savedBlog,
    });
  } catch (err) {
    console.error('Create blog error:', err);

    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to create blog',
    });
  }
});

// ======================================
// UPDATE BLOG
// ======================================
router.put('/:id', safeAuth, uploadMiddleware, async (req, res) => {
  try {
    const updateData = {};

    if (req.body.title) {
      updateData.title = req.body.title.trim();
      updateData.slug = slugify(`${req.body.title}-${Date.now()}`, {
        lower: true,
        strict: true,
      });
    }

    if (req.body.content !== undefined) updateData.content = req.body.content;
    if (req.body.excerpt !== undefined) updateData.excerpt = req.body.excerpt;
    if (req.body.category !== undefined) updateData.category = req.body.category;
    if (req.body.status !== undefined) updateData.status = req.body.status;

    if (req.file) {
      updateData.image =
        req.file?.secure_url ||
        req.file?.path ||
        req.file?.url ||
        '';
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: blog,
    });
  } catch (err) {
    console.error('Update blog error:', err);

    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to update blog',
    });
  }
});

// ======================================
// DELETE BLOG
// ======================================
router.delete('/:id', safeAuth, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (err) {
    console.error('Delete blog error:', err);

    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete blog',
    });
  }
});

module.exports = router;