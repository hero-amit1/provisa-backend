const express = require('express');
const Team = require('../../models/Team');
const auth = require('../../middleware/auth');
<<<<<<< HEAD
const multer = require('multer');

const {
  createCloudinaryStorage,
} = require('../../utils/cloudinaryStorage');

const conditionalUpload = require('../../middleware/conditionalUpload');
=======

const dotenv = require('dotenv');

const cloudinary = require('cloudinary').v2;
const {
  CloudinaryStorage,
} = require('multer-storage-cloudinary');

const multer = require('multer');

dotenv.config();
>>>>>>> 9acc1e0ae2f4d9d0826f872a87b31cc47168e2fb

const router = express.Router();

// ======================================
<<<<<<< HEAD
// CLOUDINARY STORAGE
// ======================================

const storage = createCloudinaryStorage({
  folder: 'team',
  width: 800,
=======
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
>>>>>>> 9acc1e0ae2f4d9d0826f872a87b31cc47168e2fb
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
<<<<<<< HEAD
// MULTER MIDDLEWARE
// ======================================

const uploadMiddleware =
  conditionalUpload(
    upload.single('image')
  );
=======
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
>>>>>>> 9acc1e0ae2f4d9d0826f872a87b31cc47168e2fb

// ======================================
// GET ALL TEAM MEMBERS
// ======================================

<<<<<<< HEAD
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
=======
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
>>>>>>> 9acc1e0ae2f4d9d0826f872a87b31cc47168e2fb

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
<<<<<<< HEAD
        'TEAM BODY:',
=======
        'CREATE TEAM BODY:',
>>>>>>> 9acc1e0ae2f4d9d0826f872a87b31cc47168e2fb
        req.body
      );

      console.log(
<<<<<<< HEAD
        'TEAM FILE:',
=======
        'CREATE TEAM FILE:',
>>>>>>> 9acc1e0ae2f4d9d0826f872a87b31cc47168e2fb
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

<<<<<<< HEAD
=======
      // Validation
>>>>>>> 9acc1e0ae2f4d9d0826f872a87b31cc47168e2fb
      if (!name || !role) {
        return res.status(400).json({
          success: false,
          message:
            'Name and role are required',
        });
      }

<<<<<<< HEAD
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
=======
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
>>>>>>> 9acc1e0ae2f4d9d0826f872a87b31cc47168e2fb

      res.status(201).json({
        success: true,
        message:
          'Team member created successfully',
<<<<<<< HEAD
        data: savedTeamMember,
=======
        data: teamMember,
>>>>>>> 9acc1e0ae2f4d9d0826f872a87b31cc47168e2fb
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

<<<<<<< HEAD
      if (
        req.body.name !== undefined
      ) {
=======
      // Name
      if (req.body.name !== undefined) {
>>>>>>> 9acc1e0ae2f4d9d0826f872a87b31cc47168e2fb
        updateData.name =
          req.body.name.trim();
      }

<<<<<<< HEAD
      if (
        req.body.role !== undefined
      ) {
=======
      // Role
      if (req.body.role !== undefined) {
>>>>>>> 9acc1e0ae2f4d9d0826f872a87b31cc47168e2fb
        updateData.role =
          req.body.role.trim();
      }

<<<<<<< HEAD
      if (
        req.body.bio !== undefined
      ) {
=======
      // Bio
      if (req.body.bio !== undefined) {
>>>>>>> 9acc1e0ae2f4d9d0826f872a87b31cc47168e2fb
        updateData.bio =
          req.body.bio;
      }

<<<<<<< HEAD
=======
      // Social Links
>>>>>>> 9acc1e0ae2f4d9d0826f872a87b31cc47168e2fb
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

<<<<<<< HEAD
      if (req.file) {
        updateData.image =
          req.file.secure_url ||
          req.file.path ||
          req.file.url ||
          '';
=======
      // Image
      if (req.file) {
        updateData.image =
          req.file.path;
>>>>>>> 9acc1e0ae2f4d9d0826f872a87b31cc47168e2fb
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

<<<<<<< HEAD
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

=======
>>>>>>> 9acc1e0ae2f4d9d0826f872a87b31cc47168e2fb
module.exports = router;