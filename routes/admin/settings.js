const express = require('express');
const Settings = require('../../models/Settings');
const auth = require('../../middleware/auth');

const multer = require('multer');

const {
  createCloudinaryStorage,
} = require('../../utils/cloudinaryStorage');

const conditionalUpload = require('../../middleware/conditionalUpload');

const router = express.Router();

// ======================================
// HELPERS
// ======================================

const normalizeString = (value) => {
  if (typeof value !== 'string') {
    return undefined;
  }

  return value.trim();
};

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
};

const validatePhone = (phone) => {
  return /^[0-9+\-()\s]{5,}$/.test(
    phone
  );
};

// ======================================
// CLOUDINARY STORAGE
// ======================================

const storage =
  createCloudinaryStorage({
    folder: 'settings',
    width: 400,
  });

// ======================================
// MULTER CONFIG
// ======================================

const upload = multer({
  storage,

  limits: {
    fileSize:
      2 * 1024 * 1024,
  },

  fileFilter: (
    req,
    file,
    cb
  ) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    if (
      !allowedMimeTypes.includes(
        file.mimetype
      )
    ) {
      return cb(
        new Error(
          'Only jpg, jpeg, png, and webp images are allowed'
        )
      );
    }

    cb(null, true);
  },
});

// ======================================
// CONDITIONAL UPLOAD
// ======================================

const uploadMiddleware =
  conditionalUpload(
    upload.single('logo')
  );

// ======================================
// GET SETTINGS
// ======================================

router.get(
  '/',
  auth,
  async (req, res) => {
    try {
      const settings =
        await Settings.getSingleton();

      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (err) {
      console.error(
        'Get admin settings error:',
        err
      );

      res.status(500).json({
        success: false,
        message:
          err.message ||
          'Failed to fetch settings',
      });
    }
  }
);

// ======================================
// UPDATE SETTINGS
// ======================================

router.put(
  '/',
  auth,
  uploadMiddleware,
  async (req, res) => {
    try {
      console.log(
        'SETTINGS UPDATE BODY:',
        req.body
      );

      console.log(
        'SETTINGS UPDATE FILE:',
        req.file
      );

      // Handle invalid body
      if (
        !req.body ||
        typeof req.body !==
          'object' ||
        Array.isArray(req.body)
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid request body',
        });
      }

      const allowedKeys = [
        'companyName',
        'email',
        'phone',
        'address',
        'facebook',
        'instagram',
        'linkedin',
        'whatsapp',
      ];

      const incoming = {};

      // Only allow safe fields
      allowedKeys.forEach(
        (key) => {
          if (
            req.body[key] !==
            undefined
          ) {
            incoming[key] =
              req.body[key];
          }
        }
      );

      // Logo upload
      if (req.file) {
        incoming.logo =
          req.file.secure_url ||
          req.file.path ||
          req.file.url ||
          '';
      }

      const settings =
        await Settings.getSingleton();

      let changed = false;

      // ======================================
      // COMPANY NAME
      // ======================================

      const companyName =
        normalizeString(
          incoming.companyName
        );

      if (
        typeof companyName ===
        'string'
      ) {
        settings.companyName =
          companyName;

        changed = true;
      }

      // ======================================
      // EMAIL
      // ======================================

      const email =
        normalizeString(
          incoming.email
        );

      if (
        typeof email ===
        'string'
      ) {
        if (
          email &&
          !validateEmail(email)
        ) {
          return res.status(400).json({
            success: false,
            message:
              'Invalid email format',
          });
        }

        settings.email =
          email;

        changed = true;
      }

      // ======================================
      // PHONE
      // ======================================

      const phone =
        normalizeString(
          incoming.phone
        );

      if (
        typeof phone ===
        'string'
      ) {
        if (
          phone &&
          !validatePhone(phone)
        ) {
          return res.status(400).json({
            success: false,
            message:
              'Invalid phone format',
          });
        }

        settings.phone =
          phone;

        changed = true;
      }

      // ======================================
      // ADDRESS
      // ======================================

      const address =
        normalizeString(
          incoming.address
        );

      if (
        typeof address ===
        'string'
      ) {
        settings.address =
          address;

        changed = true;
      }

      // ======================================
      // LOGO
      // ======================================

      const logo =
        normalizeString(
          incoming.logo
        );

      if (
        typeof logo ===
        'string'
      ) {
        settings.logo =
          logo;

        changed = true;
      }

      // ======================================
      // FACEBOOK
      // ======================================

      const facebook =
        normalizeString(
          incoming.facebook
        );

      if (
        typeof facebook ===
        'string'
      ) {
        settings.facebook =
          facebook;

        changed = true;
      }

      // ======================================
      // INSTAGRAM
      // ======================================

      const instagram =
        normalizeString(
          incoming.instagram
        );

      if (
        typeof instagram ===
        'string'
      ) {
        settings.instagram =
          instagram;

        changed = true;
      }

      // ======================================
      // LINKEDIN
      // ======================================

      const linkedin =
        normalizeString(
          incoming.linkedin
        );

      if (
        typeof linkedin ===
        'string'
      ) {
        settings.linkedin =
          linkedin;

        changed = true;
      }

      // ======================================
      // WHATSAPP
      // ======================================

      const whatsapp =
        normalizeString(
          incoming.whatsapp
        );

      if (
        typeof whatsapp ===
        'string'
      ) {
        settings.whatsapp =
          whatsapp;

        changed = true;
      }

      // ======================================
      // NO CHANGES
      // ======================================

      if (!changed) {
        return res.status(200).json({
          success: true,
          message:
            'No changes detected',
          data: settings,
        });
      }

      // ======================================
      // SAVE
      // ======================================

      await settings.save();

      res.status(200).json({
        success: true,
        message:
          'Settings updated successfully',
        data: settings,
      });
    } catch (err) {
      console.error(
        'Update settings error:',
        err
      );

      res.status(500).json({
        success: false,
        message:
          err.message ||
          'Failed to update settings',
      });
    }
  }
);

// ======================================
// MULTER ERROR HANDLER
// ======================================

router.use(
  (err, req, res, next) => {
    if (
      err instanceof
      multer.MulterError
    ) {
      if (
        err.code ===
        'LIMIT_FILE_SIZE'
      ) {
        return res.status(400).json({
          success: false,
          message:
            'File size too large. Maximum size is 2MB',
        });
      }

      return res.status(400).json({
        success: false,
        message:
          err.message,
      });
    }

    if (err) {
      return res.status(400).json({
        success: false,
        message:
          err.message ||
          'Upload failed',
      });
    }

    next();
  }
);

module.exports = router;