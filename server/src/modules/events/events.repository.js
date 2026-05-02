'use strict';

const db = require('../../config/db');

class EventsRepository {
  async findAll({ page = 1, limit = 12, category, status, search }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (category) {
      params.push(category);
      conditions.push(`e.category = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`e.status = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(e.title ILIKE $${params.length} OR e.description ILIKE $${params.length})`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    params.push(limit, offset);
    const dataQuery = `
      SELECT e.*, u.full_name AS organizer_name
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      ${where}
      ORDER BY e.start_at ASC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const countParams = params.slice(0, params.length - 2);
    const countQuery = `SELECT COUNT(*) FROM events e ${where}`;

    const [dataResult, countResult] = await Promise.all([
      db.query(dataQuery, params),
      db.query(countQuery, countParams),
    ]);

    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  async findById(id) {
    const { rows } = await db.query(
      `SELECT e.*, u.full_name AS organizer_name, u.email AS organizer_email
       FROM events e
       JOIN users u ON e.organizer_id = u.id
       WHERE e.id = $1 LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByOrganizer(organizerId, { page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const { rows } = await db.query(
      `SELECT * FROM events WHERE organizer_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [organizerId, limit, offset]
    );
    return rows;
  }

  async create(data) {
    const { rows } = await db.query(
      `INSERT INTO events
        (organizer_id, title, description, category, location, start_at, end_at, price_eur, capacity, cover_image_url, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        data.organizer_id,
        data.title,
        data.description,
        data.category || null,
        data.location,
        data.start_at,
        data.end_at,
        data.price_eur,
        data.capacity,
        data.cover_image_url || null,
        data.status,
      ]
    );
    return rows[0];
  }

  async update(id, organizerId, data) {
    const fields = [];
    const params = [];

    const allowed = ['title', 'description', 'category', 'location', 'start_at', 'end_at', 'price_eur', 'capacity', 'cover_image_url', 'status'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        params.push(data[key]);
        fields.push(`${key} = $${params.length}`);
      }
    }

    if (fields.length === 0) return null;

    params.push(new Date().toISOString());
    fields.push(`updated_at = $${params.length}`);

    params.push(id, organizerId);
    const { rows } = await db.query(
      `UPDATE events SET ${fields.join(', ')}
       WHERE id = $${params.length - 1} AND organizer_id = $${params.length}
       RETURNING *`,
      params
    );
    return rows[0] || null;
  }

  async updateById(id, data) {
    const fields = [];
    const params = [];

    const allowed = ['title', 'description', 'category', 'location', 'start_at', 'end_at', 'price_eur', 'capacity', 'cover_image_url', 'status'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        params.push(data[key]);
        fields.push(`${key} = $${params.length}`);
      }
    }

    if (fields.length === 0) return null;

    params.push(new Date().toISOString());
    fields.push(`updated_at = $${params.length}`);

    params.push(id);
    const { rows } = await db.query(
      `UPDATE events SET ${fields.join(', ')}
       WHERE id = $${params.length}
       RETURNING *`,
      params
    );
    return rows[0] || null;
  }

  async updateStatus(id, status, organizerId = null) {
    let query, params;
    if (organizerId) {
      query = `UPDATE events SET status = $1, updated_at = NOW() WHERE id = $2 AND organizer_id = $3 RETURNING *`;
      params = [status, id, organizerId];
    } else {
      query = `UPDATE events SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`;
      params = [status, id];
    }
    const { rows } = await db.query(query, params);
    return rows[0] || null;
  }

  async incrementTicketsSold(eventId, count = 1) {
    await db.query(
      'UPDATE events SET tickets_sold = tickets_sold + $1 WHERE id = $2',
      [count, eventId]
    );
  }

  async delete(id, organizerId) {
    await db.query('DELETE FROM events WHERE id = $1 AND organizer_id = $2', [id, organizerId]);
  }
}

module.exports = new EventsRepository();
