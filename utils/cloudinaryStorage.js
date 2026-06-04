const dotenv = require('dotenv');
dotenv.config();

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ======================================
// VALIDATE ENV VARIABLES
// ======================================

function ensureCloudinaryConfig() {
  const required = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ];

  const missing = required.filter((key) => !process.env[key]);

  // Production hard-fail prevention:
  // Allow server to start even when Cloudinary is not configured.
  // Upload routes/middleware should handle missing config when invoked.
  if (missing.length > 0) {
    console.warn(
      `[cloudinaryStorage] Missing Cloudinary environment variables: ${missing.join(', ')}. Cloudinary uploads will be disabled.`
    );
    return false;
  }


  // Debug log
  if (process.env.CLOUDINARY_DEBUG === '1') {
    console.log('================================');
    console.log('CLOUDINARY CONFIG');
    console.log('================================');

    console.log({
      cloud_name:
        process.env.CLOUDINARY_CLOUD_NAME,

      api_key:
        process.env.CLOUDINARY_API_KEY,

      api_secret_exists:
        !!process.env.CLOUDINARY_API_SECRET,

      api_secret_length:
        process.env.CLOUDINARY_API_SECRET
          ? process.env.CLOUDINARY_API_SECRET.length
          : 0,
    });

    console.log('================================');
  }

  // IMPORTANT:
  // Remove accidental spaces/newlines from .env
  cloudinary.config({
    cloud_name:
      process.env.CLOUDINARY_CLOUD_NAME.trim(),

    api_key:
      process.env.CLOUDINARY_API_KEY.trim(),

    api_secret:
      process.env.CLOUDINARY_API_SECRET.trim(),
  });
}

ensureCloudinaryConfig();

// ======================================
// DEFAULTS
// ======================================

const DEFAULT_ALLOWED_FORMATS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
];

// ======================================
// CREATE STORAGE
// ======================================

function createCloudinaryStorage({
  folder,
  width = 1200,
}) {
  if (!folder) {
    throw new Error(
      'createCloudinaryStorage: folder is required'
    );
  }

  return new CloudinaryStorage({
    cloudinary,

    // CRITICAL FIX:
    // DO NOT PASS api_key/api_secret HERE
    // It causes Invalid Signature in many versions
    params: {
      folder,

      resource_type: 'image',

      allowed_formats:
        DEFAULT_ALLOWED_FORMATS,

      transformation: [
        {
          width: Number(width),
          crop: 'limit',
        },
      ],
    },
  });
}

module.exports = {
  cloudinary,
  createCloudinaryStorage,
};