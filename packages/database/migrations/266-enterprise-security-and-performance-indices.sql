-- Migration 266: Enterprise Security & Performance Optimization Indices
-- Concurrency, Slow Query Elimination, and Connection Protection
-- Reference: CIS PostgreSQL Benchmark & High-Frequency FinTech Architecture
--
-- v543 pre-acceptance portability repair:
-- This migration never passed its first clean-DB CI/Test-candidate gate after introduction.
-- Database-level GUC changes must target the connected database rather than a hard-coded
-- development name, and ALTER DATABASE ... SET must execute outside a transaction block.

BEGIN;

-- 1. 회계 원장 고속 페이징 및 잔액 감사 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_ledger_transactions_created_at_id
  ON public.ledger_transactions (created_at DESC, id);

CREATE INDEX IF NOT EXISTS idx_ledger_postings_account_created
  ON public.ledger_postings (account_id, created_at DESC);

-- 2. 가상 주식 및 거래 체결 고속 커버링 인덱스
CREATE INDEX IF NOT EXISTS idx_virtual_stock_positions_active
  ON public.virtual_stock_positions (user_id, stock_id)
  WHERE quantity > 0;

CREATE INDEX IF NOT EXISTS idx_virtual_stock_trades_created
  ON public.virtual_stock_trades (created_at DESC, stock_id);

COMMIT;

-- 3. DB 세션 레벨 타임아웃 방어 (좀비 락 및 트랜잭션 고착 원천 차단)
-- psql \gexec safely quotes the actual connected database name. These statements
-- intentionally run after COMMIT because PostgreSQL forbids ALTER DATABASE ... SET
-- inside a transaction block.
SELECT format(
  'ALTER DATABASE %I SET statement_timeout = %L',
  current_database(),
  '15s'
) \gexec

SELECT format(
  'ALTER DATABASE %I SET idle_in_transaction_session_timeout = %L',
  current_database(),
  '30s'
) \gexec

-- 4. 통계 정보 즉시 갱신 (PostgreSQL 비용 기반 쿼리 플래너 최적화)
ANALYZE public.ledger_transactions;
ANALYZE public.ledger_postings;
ANALYZE public.account_balances;
ANALYZE public.virtual_stock_positions;
ANALYZE public.virtual_stock_trades;
ANALYZE public.private_chat_messages;
ANALYZE public.private_chat_conversations;
ANALYZE public.audit_logs;
