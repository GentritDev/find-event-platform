'use strict';

const db = require('../../config/db');

class TicketsRepository {
  async create({ order_id, user_id, event_id, qr_token }) {
    const { rows } = await db.query(
      `INSERT INTO tickets (order_id, user_id, event_id, qr_token, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING *`,
      [order_id, user_id, event_id, qr_token]
    );
    return rows[0];
  }

  async findByQRToken(qr_token) {
    const { rows } = await db.query(
      `SELECT t.*, e.title AS event_title, e.start_at, e.location, u.full_name, u.email
       FROM tickets t
       JOIN events e ON t.event_id = e.id
       JOIN users u ON t.user_id = u.id
       WHERE t.qr_token = $1 LIMIT 1`,
      [qr_token]
    );
    return rows[0] || null;
  }

  async findByUserId(user_id) {
    const { rows } = await db.query(
      `SELECT t.*, e.title AS event_title, e.start_at, e.end_at, e.location, e.cover_image_url
       FROM tickets t
       JOIN events e ON t.event_id = e.id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC`,
      [user_id]
    );
    return rows;
  }

  async findByEventId(event_id) {
    const { rows } = await db.query(
      `SELECT t.*, u.full_name, u.email
       FROM tickets t
       JOIN users u ON t.user_id = u.id
       WHERE t.event_id = $1
       ORDER BY t.created_at DESC`,
      [event_id]
    );
    return rows;
  }

  async markAsUsed(id, checked_in_by) {
    const { rows } = await db.query(
      `UPDATE tickets SET status = 'used', checked_in_at = NOW(), checked_in_by = $1
       WHERE id = $2 AND status = 'active'
       RETURNING *`,
      [checked_in_by, id]
    );
    return rows[0] || null;
  }
}

module.exports = new TicketsRepository();
