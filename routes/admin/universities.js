const express = require('express');
const University = require('../../models/University');
const auth = require('../../middleware/auth');

const dotenv = require('dotenv');

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

dotenv.config();

const router = express.Router();

// =========================
// CLOUDINARY CONFIG
// =========================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// =========================
// STORAGE
// =========================
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'universities',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, crop: 'limit' }],
  }),
});

// =========================
// MULTER
// =========================
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only jpg, jpeg, png, webp allowed'));
    }

    cb(null, true);
  },
});

// =========================
// UPLOAD MIDDLEWARE
// =========================
const uploadMiddleware = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
};

// ==============================
// GET ALL UNIVERSITIES
// ==============================
router.get('/', auth, async (req, res) => {
  try {
    const universities = await University.find()
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: universities,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch universities',
    });
  }
});

// ==============================
// CREATE UNIVERSITY
// ==============================
router.post('/', auth, uploadMiddleware, async (req, res) => {
  try {
    const {
      name,
      country,
      city,
      description,
      website,
      ranking,
      tuitionFee,
      intake,
      programs,
      featured,
      status,
    } = req.body;

    if (!name || !country) {
      return res.status(400).json({
        success: false,
        message: 'Name and country are required',
      });
    }

    let parsedPrograms = [];

    if (programs) {
      try {
        parsedPrograms =
          typeof programs === 'string'
            ? JSON.parse(programs)
            : programs;
      } catch {
        parsedPrograms = [];
      }
    }

    const university = new University({
      name: name.trim(),
      country: country.trim(),
      city: city || '',
      description: description || '',
      website: website || '',
      ranking: Number(ranking) || 0,
      tuitionFee: tuitionFee || '',
      intake: intake || '',
      programs: parsedPrograms,
      featured: featured === true || featured === 'true',
      status: status || 'active',
      image: req.file ? req.file.path : '',
    });

    await university.save();

    res.status(201).json({
      success: true,
      message: 'University created successfully',
      data: university,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to create university',
    });
  }
});

// ==============================
// UPDATE UNIVERSITY
// ==============================
router.put('/:id', auth, uploadMiddleware, async (req, res) => {
  try {
    const updateData = {};

    if (req.body.name !== undefined) updateData.name = req.body.name.trim();
    if (req.body.country !== undefined) updateData.country = req.body.country.trim();
    if (req.body.city !== undefined) updateData.city = req.body.city;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.website !== undefined) updateData.website = req.body.website;

    if (req.body.ranking !== undefined) {
      updateData.ranking = Number(req.body.ranking) || 0;
    }

    if (req.body.tuitionFee !== undefined) updateData.tuitionFee = req.body.tuitionFee;
    if (req.body.intake !== undefined) updateData.intake = req.body.intake;

    if (req.body.programs !== undefined) {
      try {
        updateData.programs =
          typeof req.body.programs === 'string'
            ? JSON.parse(req.body.programs)
            : req.body.programs;
      } catch {
        updateData.programs = [];
      }
    }

    if (req.body.featured !== undefined) {
      updateData.featured =
        req.body.featured === true || req.body.featured === 'true';
    }

    if (req.body.status !== undefined) updateData.status = req.body.status;

    if (req.file) {
      updateData.image = req.file.path;
    }

    const university = await University.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'University updated successfully',
      data: university,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to update university',
    });
  }
});

// ==============================
// DELETE UNIVERSITY
// ==============================
router.delete('/:id', auth, async (req, res) => {
  try {
    const university = await University.findByIdAndDelete(req.params.id);

    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'University deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete university',
    });
  }
});

module.exports = router;