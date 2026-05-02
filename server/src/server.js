'use strict';

require('dotenv').config();
const app = require('./app');
const env = require('./config/env');
const db = require('./config/db');

const PORT = env.PORT;

async function start() {
  try {
    // Test database connection
    await db.query('SELECT 1');
    console.log('[server] Database connected successfully');

    app.listen(PORT, () => {
      console.log(`[server] Running on http://localhost:${PORT} (${env.NODE_ENV})`);
    });
  } catch (err) {
    console.error('[server] Failed to start:', err.message);
    process.exit(1);
  }
}

start();
