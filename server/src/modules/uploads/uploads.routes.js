'use strict';

const router = require('express').Router();
const uploadsController = require('./uploads.controller');
const authenticate = require('../../middlewares/auth');
const requireRoles = require('../../middlewares/roles');

router.use(authenticate);
router.use(requireRoles('organizer', 'admin'));

router.post(
  '/image',
  uploadsController.uploadMiddleware(),
  (req, res, next) => uploadsController.uploadImage(req, res, next)
);

module.exports = router;
