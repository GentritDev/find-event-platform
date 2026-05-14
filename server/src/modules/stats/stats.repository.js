"use strict";

const db = require("../../config/db");

class StatsRepository {
  async getOverview() {
    const [userRows, eventRows, revenueRows, ticketRows] = await Promise.all([
      db.query(`SELECT role, COUNT(*) AS count FROM users GROUP BY role`),

      db.query(`SELECT status, COUNT(*) AS count FROM events GROUP BY status`),

      db.query(`
        SELECT COALESCE(SUM(amount_eur), 0) AS total_revenue 
        FROM orders 
        WHERE payment_status = 'paid'
      `),

      db.query(`
        SELECT COUNT(*) AS active_tickets 
        FROM tickets 
        WHERE status = 'active'
      `),
    ]);

    const overview = {
      total_users: 0,
      total_organizers: 0,
      total_admins: 0,

      total_events: 0,
      published_events: 0,
      draft_events: 0,
      cancelled_events: 0,

      total_revenue: parseFloat(revenueRows.rows[0]?.total_revenue || 0),
      active_tickets: parseInt(ticketRows.rows[0]?.active_tickets || 0, 10),
    };

    for (const row of userRows.rows) {
      if (row.role === "admin") overview.total_admins = parseInt(row.count, 10);
      if (row.role === "organizer")
        overview.total_organizers = parseInt(row.count, 10);
      if (row.role === "user") overview.total_users = parseInt(row.count, 10);
    }

    for (const row of eventRows.rows) {
      if (row.status === "published")
        overview.published_events = parseInt(row.count, 10);
      if (row.status === "draft")
        overview.draft_events = parseInt(row.count, 10);
      if (row.status === "cancelled")
        overview.cancelled_events = parseInt(row.count, 10);

      overview.total_events += parseInt(row.count, 10);
    }

    return overview;
  }

  async getRevenueByRole(organizerId, role) {
    if (role === "admin") {
      const { rows } = await db.query(`
        SELECT COALESCE(SUM(amount_eur), 0) AS total_revenue
        FROM orders
        WHERE payment_status = 'paid'
      `);

      return {
        total_revenue: parseFloat(rows[0]?.total_revenue || 0),
      };
    }

    const { rows } = await db.query(
      `
      SELECT COALESCE(SUM(o.amount_eur), 0) AS total_revenue
      FROM orders o
      JOIN events e ON o.event_id = e.id
      WHERE o.payment_status = 'paid'
        AND e.organizer_id = $1
    `,
      [organizerId],
    );

    return {
      total_revenue: parseFloat(rows[0]?.total_revenue || 0),
    };
  }

  async getRevenueOverTime(organizerId, role) {
    if (role === "admin") {
      const { rows } = await db.query(`
        SELECT DATE(created_at) AS date,
               COALESCE(SUM(amount_eur), 0) AS revenue
        FROM orders
        WHERE payment_status = 'paid'
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) ASC
      `);

      return rows;
    }

    const { rows } = await db.query(
      `
      SELECT DATE(o.created_at) AS date,
             COALESCE(SUM(o.amount_eur), 0) AS revenue
      FROM orders o
      JOIN events e ON o.event_id = e.id
      WHERE o.payment_status = 'paid'
        AND e.organizer_id = $1
      GROUP BY DATE(o.created_at)
      ORDER BY DATE(o.created_at) ASC
    `,
      [organizerId],
    );

    return rows;
  }
}

module.exports = new StatsRepository();
