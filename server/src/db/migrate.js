'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function migrate() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  console.log('[migrate] Starting database migration...');

  for (const file of files) {
    if (!file.endsWith('.sql')) continue;
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`[migrate] Running: ${file}`);

    // Run each migration file inside its own transaction so that a failure
    // rolls back the partial changes and leaves the DB in a consistent state.
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log(`[migrate] Done: ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  console.log('[migrate] All migrations completed.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('[migrate] Migration failed:', err);
  process.exit(1);
});
