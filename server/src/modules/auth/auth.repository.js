'use strict';

const db = require('../../config/db');

class AuthRepository {
  async findByEmail(email) {
    const { rows } = await db.query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const { rows } = await db.query(
      'SELECT id, full_name, email, role, avatar_url, created_at FROM users WHERE id = $1 LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }

  async create({ full_name, email, password_hash, role }) {
    const { rows } = await db.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role, created_at`,
      [full_name, email, password_hash, role]
    );
    return rows[0];
  }
}

module.exports = new AuthRepository();
