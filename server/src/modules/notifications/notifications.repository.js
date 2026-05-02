'use strict';

const db = require('../../config/db');

class NotificationsRepository {
  async create({ user_id, title, body, type = 'info' }) {
    const { rows } = await db.query(
      `INSERT INTO notifications (user_id, title, body, type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, title, body, type]
    );
    return rows[0];
  }

  async findByUserId(user_id, limit = 50) {
    const { rows } = await db.query(
      `SELECT * FROM notifications WHERE user_id = $1
       ORDER BY created_at DESC LIMIT $2`,
      [user_id, limit]
    );
    return rows;
  }

  async markRead(id, user_id) {
    const { rows } = await db.query(
      `UPDATE notifications SET read_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, user_id]
    );
    return rows[0] || null;
  }

  async markAllRead(user_id) {
    await db.query(
      `UPDATE notifications SET read_at = NOW()
       WHERE user_id = $1 AND read_at IS NULL`,
      [user_id]
    );
  }

  async getUnreadCount(user_id) {
    const { rows } = await db.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read_at IS NULL',
      [user_id]
    );
    return parseInt(rows[0].count, 10);
  }
}

module.exports = new NotificationsRepository();
