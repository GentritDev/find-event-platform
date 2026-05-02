'use strict';

const notificationsService = require('./notifications.service');

class NotificationsController {
  async getMyNotifications(req, res, next) {
    try {
      const notifications = await notificationsService.getMyNotifications(req.user.id);
      return res.json({ success: true, data: notifications });
    } catch (err) {
      next(err);
    }
  }

  async markRead(req, res, next) {
    try {
      const notification = await notificationsService.markRead(req.params.id, req.user.id);
      return res.json({ success: true, data: notification });
    } catch (err) {
      next(err);
    }
  }

  async markAllRead(req, res, next) {
    try {
      await notificationsService.markAllRead(req.user.id);
      return res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
      next(err);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const count = await notificationsService.getUnreadCount(req.user.id);
      return res.json({ success: true, data: { count } });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationsController();
