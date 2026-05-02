'use strict';

const notificationsRepository = require('./notifications.repository');

class NotificationsService {
  async create({ user_id, title, body, type = 'info' }) {
    return notificationsRepository.create({ user_id, title, body, type });
  }

  async getMyNotifications(user_id) {
    return notificationsRepository.findByUserId(user_id);
  }

  async markRead(id, user_id) {
    return notificationsRepository.markRead(id, user_id);
  }

  async markAllRead(user_id) {
    return notificationsRepository.markAllRead(user_id);
  }

  async getUnreadCount(user_id) {
    return notificationsRepository.getUnreadCount(user_id);
  }
}

module.exports = new NotificationsService();
