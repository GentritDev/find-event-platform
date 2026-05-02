'use strict';

const db = require('../../config/db');

class AdminService {
  async getDashboardStats() {
    const [usersResult, eventsResult, ordersResult, ticketsResult] = await Promise.all([
      db.query('SELECT COUNT(*), role FROM users GROUP BY role'),
      db.query("SELECT COUNT(*), status FROM events GROUP BY status"),
      db.query("SELECT COUNT(*), payment_status FROM orders GROUP BY payment_status"),
      db.query("SELECT COUNT(*) FROM tickets WHERE status = 'active'"),
    ]);

    return {
      users: usersResult.rows,
      events: eventsResult.rows,
      orders: ordersResult.rows,
      active_tickets: parseInt(ticketsResult.rows[0]?.count || 0, 10),
    };
  }

  async getAllUsers({ page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const { rows } = await db.query(
      `SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const countResult = await db.query('SELECT COUNT(*) FROM users');
    return { data: rows, total: parseInt(countResult.rows[0].count, 10) };
  }

  async updateUserRole(userId, role) {
    const validRoles = ['user', 'organizer', 'admin'];
    if (!validRoles.includes(role)) {
      const err = new Error('Invalid role');
      err.status = 400;
      throw err;
    }

    const { rows } = await db.query(
      `UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2
       RETURNING id, full_name, email, role`,
      [role, userId]
    );
    if (!rows[0]) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    return rows[0];
  }

  async getAllEvents({ page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const { rows } = await db.query(
      `SELECT e.*, u.full_name AS organizer_name FROM events e
       JOIN users u ON e.organizer_id = u.id
       ORDER BY e.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const countResult = await db.query('SELECT COUNT(*) FROM events');
    return { data: rows, total: parseInt(countResult.rows[0].count, 10) };
  }

  async getRevenueStats() {
    const { rows } = await db.query(
      `SELECT
        SUM(amount_eur) AS total_revenue,
        COUNT(*) AS total_orders,
        AVG(amount_eur) AS avg_order
       FROM orders WHERE payment_status = 'paid'`
    );
    return rows[0];
  }
}

module.exports = new AdminService();
