const express = require('express');
const Settings = require('../../models/Settings');
const auth = require('../../middleware/auth');

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const router = express.Router();

// ==============================
// HELPERS
// ==============================
const normalizeString = (value) => {
  if (typeof value !== 'string') return undefined;
  return value.trim();
};

const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePhone = (phone) =>
  /^[0-9+\-()\s]{5,}$/.test(phone);

// ==============================
// CLOUDINARY CONFIG
// ==============================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ==============================
// STORAGE
// ==============================
const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: 'settings',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, crop: 'limit' }],
  }),
});

// ==============================
// MULTER
// ==============================
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

// ==============================
// UPLOAD MIDDLEWARE
// ==============================
const uploadMiddleware = (req, res, next) => {
  upload.single('logo')(req, res, (err) => {
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
// GET SETTINGS
// ==============================
router.get('/', auth, async (req, res) => {
  try {
    const settings = await Settings.getSingleton();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch settings',
    });
  }
});

// ==============================
// UPDATE SETTINGS
// ==============================
router.put('/', auth, uploadMiddleware, async (req, res) => {
  try {
    const incoming = req.body || {};

    if (req.file) {
      incoming.logo = req.file.path;
    }

    const settings = await Settings.getSingleton();
    let changed = false;

    const setField = (key, transform = (v) => v) => {
      if (incoming[key] !== undefined) {
        const value = transform(incoming[key]);
        if (value !== undefined) {
          settings[key] = value;
          changed = true;
        }
      }
    };

    setField('companyName', normalizeString);

    setField('email', (v) => {
      const val = normalizeString(v);
      if (val && !validateEmail(val)) {
        throw new Error('Invalid email format');
      }
      return val;
    });

    setField('phone', (v) => {
      const val = normalizeString(v);
      if (val && !validatePhone(val)) {
        throw new Error('Invalid phone format');
      }
      return val;
    });

    setField('address', normalizeString);
    setField('logo', normalizeString);
    setField('facebook', normalizeString);
    setField('instagram', normalizeString);
    setField('linkedin', normalizeString);
    setField('whatsapp', normalizeString);

    if (!changed) {
      return res.json({
        success: true,
        message: 'No changes detected',
        data: settings,
      });
    }

    await settings.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to update settings',
    });
  }
});

module.exports = router;