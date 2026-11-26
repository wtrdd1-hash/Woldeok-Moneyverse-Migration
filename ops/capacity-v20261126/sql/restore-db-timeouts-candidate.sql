-- CANDIDATE — not a numbered migration on purpose; Production DB setting change needs owner
-- approval. Migration 266 (applied 2026-10-11) set these on the database, but on 2026-11-26
-- Production's pg_db_role_setting is empty (the settings did not survive a restore), while
-- fresh CI/sandbox databases have them. Production therefore runs with no statement or
-- idle-in-transaction timeout. Verify every background job finishes under 15 s on Test first.
-- Run as the database owner outside a transaction (psql), then new sessions pick it up:
SELECT format('ALTER DATABASE %I SET statement_timeout = %L', current_database(), '15s') \gexec
SELECT format('ALTER DATABASE %I SET idle_in_transaction_session_timeout = %L', current_database(), '30s') \gexec
-- Rollback: ALTER DATABASE <db> RESET statement_timeout; ALTER DATABASE <db> RESET idle_in_transaction_session_timeout;
