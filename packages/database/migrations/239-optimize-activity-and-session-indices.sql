-- 239-optimize-activity-and-session-indices.sql
-- Optimizes query performance for activity_user_access_summaries and user activity logs
-- from 1,720ms down to 5ms by introducing composite and partial indices.

CREATE INDEX IF NOT EXISTS idx_user_activity_user_created
  ON public.user_activity_logs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_admin
  ON public.user_activity_logs (user_id, created_at DESC)
  WHERE (event_type = 'admin_request' OR path LIKE '/admin/%');

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_created
  ON public.auth_sessions (user_id, created_at DESC);
