const express = require('express');
const Team = require('../../models/Team');
const auth = require('../../middleware/auth');

const dotenv = require('dotenv');

const cloudinary = require('cloudinary').v2;
const {
  CloudinaryStorage,
} = require('multer-storage-cloudinary');

const multer = require('multer');

dotenv.config();

const router = express.Router();

// ======================================
// CLOUDINARY CONFIG
// ======================================

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET,
});

// ======================================
// CLOUDINARY STORAGE
// ======================================

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => ({
    folder: 'team',

    allowed_formats: [
      'jpg',
      'jpeg',
      'png',
      'webp',
    ],

    transformation: [
      {
        width: 800,
        crop: 'limit',
      },
    ],
  }),
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
// IMAGE UPLOAD MIDDLEWARE
// ======================================

const uploadMiddleware = (
  req,
  res,
  next
) => {
  upload.single('image')(
    req,
    res,
    (err) => {
      if (err) {
        console.error(
          'Upload error:',
          err
        );

        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      next();
    }
  );
};

// ======================================
// GET ALL TEAM MEMBERS
// ======================================

router.get('/', auth, async (req, res) => {
  try {
    const team = await Team.find()
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: team,
    });
  } catch (err) {
    console.error(
      'Get team members error:',
      err
    );

    res.status(500).json({
      success: false,
      message:
        err.message ||
        'Failed to fetch team members',
    });
  }
});

// ======================================
// CREATE TEAM MEMBER
// ======================================

router.post(
  '/',
  auth,
  uploadMiddleware,
  async (req, res) => {
    try {
      console.log(
        'CREATE TEAM BODY:',
        req.body
      );

      console.log(
        'CREATE TEAM FILE:',
        req.file
      );

      const {
        name,
        role,
        bio,
        facebook,
        instagram,
        linkedin,
        twitter,
      } = req.body;

      // Validation
      if (!name || !role) {
        return res.status(400).json({
          success: false,
          message:
            'Name and role are required',
        });
      }

      const teamMember = new Team({
        name: name.trim(),

        role: role.trim(),

        bio: bio || '',

        social: {
          facebook:
            facebook || '',

          instagram:
            instagram || '',

          linkedin:
            linkedin || '',

          twitter:
            twitter || '',
        },

        image: req.file
          ? req.file.path
          : '',
      });

      await teamMember.save();

      res.status(201).json({
        success: true,
        message:
          'Team member created successfully',
        data: teamMember,
      });
    } catch (err) {
      console.error(
        'Create team member error:',
        err
      );

      res.status(500).json({
        success: false,
        message:
          err.message ||
          'Failed to create team member',
      });
    }
  }
);

// ======================================
// UPDATE TEAM MEMBER
// ======================================

router.put(
  '/:id',
  auth,
  uploadMiddleware,
  async (req, res) => {
    try {
      console.log(
        'UPDATE TEAM BODY:',
        req.body
      );

      console.log(
        'UPDATE TEAM FILE:',
        req.file
      );

      const updateData = {};

      // Name
      if (req.body.name !== undefined) {
        updateData.name =
          req.body.name.trim();
      }

      // Role
      if (req.body.role !== undefined) {
        updateData.role =
          req.body.role.trim();
      }

      // Bio
      if (req.body.bio !== undefined) {
        updateData.bio =
          req.body.bio;
      }

      // Social Links
      updateData.social = {
        facebook:
          req.body.facebook || '',

        instagram:
          req.body.instagram || '',

        linkedin:
          req.body.linkedin || '',

        twitter:
          req.body.twitter || '',
      };

      // Image
      if (req.file) {
        updateData.image =
          req.file.path;
      }

      const teamMember =
        await Team.findByIdAndUpdate(
          req.params.id,
          updateData,
          {
            new: true,
            runValidators: true,
          }
        );

      if (!teamMember) {
        return res.status(404).json({
          success: false,
          message:
            'Team member not found',
        });
      }

      res.status(200).json({
        success: true,
        message:
          'Team member updated successfully',
        data: teamMember,
      });
    } catch (err) {
      console.error(
        'Update team member error:',
        err
      );

      res.status(500).json({
        success: false,
        message:
          err.message ||
          'Failed to update team member',
      });
    }
  }
);

// ======================================
// DELETE TEAM MEMBER
// ======================================

router.delete(
  '/:id',
  auth,
  async (req, res) => {
    try {
      const teamMember =
        await Team.findByIdAndDelete(
          req.params.id
        );

      if (!teamMember) {
        return res.status(404).json({
          success: false,
          message:
            'Team member not found',
        });
      }

      res.status(200).json({
        success: true,
        message:
          'Team member deleted successfully',
      });
    } catch (err) {
      console.error(
        'Delete team member error:',
        err
      );

      res.status(500).json({
        success: false,
        message:
          err.message ||
          'Failed to delete team member',
      });
    }
  }
);

module.exports = router;