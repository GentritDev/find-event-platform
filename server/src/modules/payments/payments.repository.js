'use strict';

const db = require('../../config/db');

class PaymentsRepository {
  async createOrder({ user_id, event_id, amount_eur, currency, provider_order_id }) {
    const { rows } = await db.query(
      `INSERT INTO orders (user_id, event_id, amount_eur, currency, provider, payment_status, provider_order_id)
       VALUES ($1, $2, $3, $4, 'paypal', 'pending', $5)
       RETURNING *`,
      [user_id, event_id, amount_eur, currency, provider_order_id]
    );
    return rows[0];
  }

  async findOrderByProviderId(provider_order_id) {
    const { rows } = await db.query(
      'SELECT * FROM orders WHERE provider_order_id = $1 LIMIT 1',
      [provider_order_id]
    );
    return rows[0] || null;
  }

  async findOrderById(id) {
    const { rows } = await db.query(
      'SELECT * FROM orders WHERE id = $1 LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }

  async markOrderPaid(id, provider_capture_id) {
    const { rows } = await db.query(
      `UPDATE orders SET payment_status = 'paid', provider_capture_id = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [provider_capture_id, id]
    );
    return rows[0];
  }

  async markOrderFailed(id) {
    const { rows } = await db.query(
      `UPDATE orders SET payment_status = 'failed', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    return rows[0];
  }

  async getUserOrders(userId) {
    const { rows } = await db.query(
      `SELECT o.*, e.title AS event_title, e.start_at, e.location
       FROM orders o
       JOIN events e ON o.event_id = e.id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return rows;
  }
}

module.exports = new PaymentsRepository();
