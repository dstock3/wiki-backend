const multer = require('multer');
const path = require('path');
const logger = require('../logger');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: File upload only supports the following filetypes - ' + filetypes));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: 5000000,
    fieldNameSize: 100, 
    fieldSize: 6 * 1024 * 1024 
  }
});

const uploadMiddleware = (req, res, next) => {
  upload.single('image')(req, res, function(err) {
    if (err) {
      logger.warn({
        action: 'Image Upload Failed',
        errorMessage: err.message,
        fileType: req.file ? req.file.mimetype : null,
        userId: req.user ? req.user._id : null
      });
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

module.exports = { uploadMiddleware };