-- 000_repair_legacy.sql
-- Guard migration: detects legacy tables that use SERIAL/integer primary keys
-- instead of UUID and drops them so that migration 001 can recreate them
-- with the correct UUID types and FK constraints.
--
-- This is a NO-OP when:
--   * The database is empty (no tables yet), or
--   * Tables already use uuid primary keys (correct schema).
--
-- It only drops tables when users.id is NOT a uuid column (i.e. the old
-- integer-ID schema is present), which would cause orders_user_id_fkey and
-- similar FK type-mismatch errors in migration 001.

DO $$
DECLARE
  v_type TEXT;
BEGIN
  SELECT data_type INTO v_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name   = 'users'
    AND column_name  = 'id';

  IF v_type IS NOT NULL AND lower(v_type) <> 'uuid' THEN
    RAISE NOTICE '[repair] Legacy integer-ID schema detected (users.id type: %). Dropping all tables for clean rebuild.', v_type;

    -- Drop in reverse FK dependency order so constraints are satisfied.
    DROP TABLE IF EXISTS notifications CASCADE;
    DROP TABLE IF EXISTS tickets       CASCADE;
    DROP TABLE IF EXISTS orders        CASCADE;
    DROP TABLE IF EXISTS events        CASCADE;
    DROP TABLE IF EXISTS users         CASCADE;

    RAISE NOTICE '[repair] Legacy tables dropped. Migration 001 will recreate them with UUID primary keys.';
  ELSE
    RAISE NOTICE '[repair] Schema OK (uuid ids or empty database). No action needed.';
  END IF;
END $$;
