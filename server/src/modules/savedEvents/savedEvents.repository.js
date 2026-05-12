"use strict";

const db = require("../../config/db");

class SavedEventsRepository {
  async findByUserId(user_id) {
    const { rows } = await db.query(
      `SELECT
        se.id,
        se.event_id,
        se.saved_at,
        e.title,
        e.description,
        e.category,
        e.location,
        e.start_at,
        e.end_at,
        e.price_eur,
        e.capacity,
        e.tickets_sold,
        e.cover_image_url,
        e.status,
        u.full_name AS organizer_name
       FROM saved_events se
       JOIN events e ON se.event_id = e.id
       JOIN users u ON e.organizer_id = u.id
       WHERE se.user_id = $1
       ORDER BY se.saved_at DESC`,
      [user_id],
    );
    return rows;
  }

  async existsByUserIdAndEventId(user_id, event_id) {
    const { rows } = await db.query(
      `SELECT 1 FROM saved_events WHERE user_id = $1 AND event_id = $2 LIMIT 1`,
      [user_id, event_id],
    );
    return rows.length > 0;
  }

  async create({ user_id, event_id }) {
    const { rows } = await db.query(
      `INSERT INTO saved_events (user_id, event_id) VALUES ($1, $2) RETURNING *`,
      [user_id, event_id],
    );
    return rows[0];
  }

  async deleteByUserIdAndEventId(user_id, event_id) {
    const { rows } = await db.query(
      `DELETE FROM saved_events WHERE user_id = $1 AND event_id = $2 RETURNING *`,
      [user_id, event_id],
    );
    return rows[0] || null;
  }
}

module.exports = new SavedEventsRepository();
