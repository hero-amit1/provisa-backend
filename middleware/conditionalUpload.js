const getFileToUpload = (req) => {
  const ct = req.headers['content-type'] || '';

  const isMultipart =
    typeof ct === 'string' &&
    ct.includes('multipart/form-data');

  return { isMultipart };
};

/**
 * Run multer only when multipart/form-data exists.
 *
 * Usage:
 *   conditionalUpload(upload.single('image'))
 */
function conditionalUpload(multerMiddleware) {
  return (req, res, next) => {
    const { isMultipart } = getFileToUpload(req);

    // No multipart request -> skip multer
    if (!isMultipart) {
      return next();
    }

    // Safety check
    if (typeof multerMiddleware !== 'function') {
      return res.status(500).json({
        success: false,
        message:
          'Upload middleware is invalid. Use upload.single(), upload.array(), or upload.fields().',
      });
    }

    // Run multer middleware
    multerMiddleware(req, res, (err) => {
      if (err) {
        console.error('Upload Error:', err);

        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed',
        });
      }

      next();
    });
  };
}

// Export directly
module.exports = conditionalUpload;