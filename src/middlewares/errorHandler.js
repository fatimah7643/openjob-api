const multer = require('multer');

const errorHandler = (err, req, res, next) => {

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ status: 'failed', message: 'File too large. Maximum size is 5MB' });
    }
    return res.status(400).json({ status: 'failed', message: err.message });
  }

  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ status: 'failed', message: err.message });
  }

  console.error(err);
  return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
};

module.exports = errorHandler;