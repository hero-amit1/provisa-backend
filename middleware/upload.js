const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ======================================
// CREATE UPLOADS DIRECTORY IF NOT EXISTS
// ======================================

const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ======================================
// MULTER STORAGE CONFIG
// ======================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

// ======================================
// FILE FILTER
// ======================================

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Only image files (jpg, jpeg, png, webp, gif) are allowed'
      ),
      false
    );
  }
};

// ======================================
// MULTER INSTANCE
// ======================================

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;