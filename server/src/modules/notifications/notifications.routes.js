'use strict';

const router = require('express').Router();
const notificationsController = require('./notifications.controller');
const authenticate = require('../../middlewares/auth');

router.use(authenticate);

router.get('/me', (req, res, next) => notificationsController.getMyNotifications(req, res, next));
router.get('/unread-count', (req, res, next) => notificationsController.getUnreadCount(req, res, next));
router.patch('/:id/read', (req, res, next) => notificationsController.markRead(req, res, next));
router.patch('/read-all', (req, res, next) => notificationsController.markAllRead(req, res, next));

module.exports = router;
