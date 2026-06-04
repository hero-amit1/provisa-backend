const express = require('express');
const Testimonial = require('../../models/Testimonial');
const auth = require('../../middleware/auth');

<<<<<<< HEAD
const multer = require('multer');

const {
  createCloudinaryStorage,
} = require('../../utils/cloudinaryStorage');

=======
>>>>>>> 9acc1e0ae2f4d9d0826f872a87b31cc47168e2fb
const router = express.Router();

// ======================================
// GET ALL TESTIMONIALS
// ======================================

router.get('/', auth, async (req, res) => {
  try {
    const testimonials =
      await Testimonial.find()
        .sort({ createdAt: -1 })
        .lean();

    res.status(200).json({
      success: true,
      data: testimonials,
    });
  } catch (err) {
    console.error(
      'Get testimonials error:',
      err
    );

    res.status(500).json({
      success: false,
      message:
        err.message ||
        'Failed to fetch testimonials',
    });
  }
});

// ======================================
<<<<<<< HEAD
// CLOUDINARY STORAGE
// ======================================

const storage = createCloudinaryStorage({
  folder: 'testimonials',
  width: 1000,
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error('Only jpg, jpeg, png, and webp images are allowed')
      );
    }

    cb(null, true);
  },
});

const uploadMiddleware = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message,
        cloudinaryHttpCode: err.http_code,
        cloudinaryErrorName: err.name,
        cloudinaryDebugString:
          process.env.CLOUDINARY_DEBUG === '1'
            ? 'enabled'
            : 'disabled',
      });
    }
    next();
  });
};

// ======================================
// CREATE TESTIMONIAL
// ======================================

router.post('/', auth, uploadMiddleware, async (req, res) => {
=======
// CREATE TESTIMONIAL
// ======================================

router.post('/', auth, async (req, res) => {
>>>>>>> 9acc1e0ae2f4d9d0826f872a87b31cc47168e2fb
  try {
    console.log(
      'CREATE TESTIMONIAL BODY:',
      req.body
    );

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

    // Validation
    if (!name || !university || !text) {
      return res.status(400).json({
        success: false,
        message:
          'Name, university, and text are required',
      });
    }

<<<<<<< HEAD
    const testimonial = new Testimonial({
      name: name.trim(),

      university: university.trim(),

      text: text.trim(),

      rating: Number(rating) || 5,

      image: req.file
        ? req.file.secure_url ||
          req.file.url ||
          req.file.path ||
          req.file.filename ||
          ''
        : image || '',

      country: country || '',

      course: course || '',

      featured:
        featured === true || featured === 'true',

      status: status || 'active',
    });
=======
    const testimonial =
      new Testimonial({
        name: name.trim(),

        university:
          university.trim(),

        text: text.trim(),

        rating:
          Number(rating) || 5,

        image: image || '',

        country: country || '',

        course: course || '',

        featured:
          featured === true ||
          featured === 'true',

        status:
          status || 'active',
      });
>>>>>>> 9acc1e0ae2f4d9d0826f872a87b31cc47168e2fb

    await testimonial.save();

    res.status(201).json({
      success: true,
      message:
        'Testimonial created successfully',
      data: testimonial,
    });
  } catch (err) {
    console.error(
      'Create testimonial error:',
      err
    );

    res.status(400).json({
      success: false,
      message:
        err.message ||
        'Failed to create testimonial',
    });
  }
});

// ======================================
// UPDATE TESTIMONIAL
// ======================================

<<<<<<< HEAD
router.put('/:id', auth, uploadMiddleware, async (req, res) => {
=======
router.put('/:id', auth, async (req, res) => {
>>>>>>> 9acc1e0ae2f4d9d0826f872a87b31cc47168e2fb
  try {
    console.log(
      'UPDATE TESTIMONIAL BODY:',
      req.body
    );

    const updateData = {};

    // Name
    if (req.body.name !== undefined) {
      updateData.name =
        req.body.name.trim();
    }

    // University
    if (
      req.body.university !==
      undefined
    ) {
      updateData.university =
        req.body.university.trim();
    }

    // Text
    if (req.body.text !== undefined) {
      updateData.text =
        req.body.text.trim();
    }

    // Rating
    if (
      req.body.rating !== undefined
    ) {
      updateData.rating = Number(
        req.body.rating
      );
    }

<<<<<<< HEAD
    // Image (optional)
    if (req.file) {
      updateData.image =
        req.file.secure_url ||
        req.file.url ||
        req.file.path ||
        req.file.filename;
    } else if (
      req.body.image !== undefined &&
      req.body.image !== ''
    ) {
      updateData.image = req.body.image;
=======
    // Image
    if (
      req.body.image !== undefined
    ) {
      updateData.image =
        req.body.image;
>>>>>>> 9acc1e0ae2f4d9d0826f872a87b31cc47168e2fb
    }

    // Country
    if (
      req.body.country !== undefined
    ) {
      updateData.country =
        req.body.country;
    }

    // Course
    if (
      req.body.course !== undefined
    ) {
      updateData.course =
        req.body.course;
    }

    // Featured
    if (
      req.body.featured !== undefined
    ) {
      updateData.featured =
        req.body.featured === true ||
        req.body.featured ===
          'true';
    }

    // Status
    if (
      req.body.status !== undefined
    ) {
      updateData.status =
        req.body.status;
    }

    const testimonial =
      await Testimonial.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message:
          'Testimonial not found',
      });
    }

    res.status(200).json({
      success: true,
      message:
        'Testimonial updated successfully',
      data: testimonial,
    });
  } catch (err) {
    console.error(
      'Update testimonial error:',
      err
    );

    res.status(400).json({
      success: false,
      message:
        err.message ||
        'Failed to update testimonial',
    });
  }
});

// ======================================
// DELETE TESTIMONIAL
// ======================================

router.delete('/:id', auth, async (req, res) => {
  try {
    const testimonial =
      await Testimonial.findByIdAndDelete(
        req.params.id
      );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message:
          'Testimonial not found',
      });
    }

    res.status(200).json({
      success: true,
      message:
        'Testimonial deleted successfully',
    });
  } catch (err) {
    console.error(
      'Delete testimonial error:',
      err
    );

    res.status(500).json({
      success: false,
      message:
        err.message ||
        'Failed to delete testimonial',
    });
  }
});

module.exports = router;