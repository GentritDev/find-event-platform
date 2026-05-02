'use strict';

const multer = require('multer');
const uploadsService = require('./uploads.service');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpg, png, webp, gif)'));
    }
  },
});

class UploadsController {
  uploadMiddleware() {
    return upload.single('image');
  }

  async uploadImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file provided' });
      }

      const result = await uploadsService.uploadImage(
        req.file.buffer,
        req.file.originalname,
        'events'
      );

      return res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UploadsController();
