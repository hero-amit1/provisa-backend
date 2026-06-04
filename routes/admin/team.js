const express = require('express');
const Team = require('../../models/Team');
const auth = require('../../middleware/auth');
const multer = require('multer');

const {
  createCloudinaryStorage,
} = require('../../utils/cloudinaryStorage');

const conditionalUpload = require('../../middleware/conditionalUpload');

const router = express.Router();

// ======================================
// CLOUDINARY STORAGE
// ======================================

const storage = createCloudinaryStorage({
  folder: 'team',
  width: 800,
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
// MULTER MIDDLEWARE
// ======================================

const uploadMiddleware =
  conditionalUpload(
    upload.single('image')
  );

// ======================================
// GET ALL TEAM MEMBERS
// ======================================

router.get(
  '/',
  auth,
  async (req, res) => {
    try {
      const team = await Team.find()
        .sort({
          createdAt: -1,
        });

      res.status(200).json({
        success: true,
        data: team,
      });
    } catch (err) {
      console.error(
        'GET /team error:',
        err
      );

      res.status(500).json({
        success: false,
        message:
          err.message ||
          'Failed to fetch team',
      });
    }
  }
);

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
        'TEAM BODY:',
        req.body
      );

      console.log(
        'TEAM FILE:',
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

      if (!name || !role) {
        return res.status(400).json({
          success: false,
          message:
            'Name and role are required',
        });
      }

      const teamMember =
        new Team({
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
            ? req.file.secure_url ||
              req.file.path ||
              req.file.url ||
              ''
            : '',
        });

      const savedTeamMember =
        await teamMember.save();

      res.status(201).json({
        success: true,
        message:
          'Team member created successfully',
        data: savedTeamMember,
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

      if (
        req.body.name !== undefined
      ) {
        updateData.name =
          req.body.name.trim();
      }

      if (
        req.body.role !== undefined
      ) {
        updateData.role =
          req.body.role.trim();
      }

      if (
        req.body.bio !== undefined
      ) {
        updateData.bio =
          req.body.bio;
      }

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

      if (req.file) {
        updateData.image =
          req.file.secure_url ||
          req.file.path ||
          req.file.url ||
          '';
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
        message: err.message,
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