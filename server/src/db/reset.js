'use strict';

require('dotenv').config();
const db = require('../config/db');

async function reset() {
  console.log('[db:reset] Dropping all application tables...');

  // Drop in reverse FK dependency order.
  await db.query(`
    DROP TABLE IF EXISTS notifications CASCADE;
    DROP TABLE IF EXISTS tickets       CASCADE;
    DROP TABLE IF EXISTS orders        CASCADE;
    DROP TABLE IF EXISTS events        CASCADE;
    DROP TABLE IF EXISTS users         CASCADE;
  `);

  console.log('[db:reset] Done. Run "npm run migrate" to recreate the schema.');
  process.exit(0);
}

reset().catch((err) => {
  console.error('[db:reset] Failed:', err);
  process.exit(1);
});
