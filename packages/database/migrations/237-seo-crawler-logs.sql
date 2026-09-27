-- 237-seo-crawler-logs.sql
-- Search engine crawler access log table for Google Search Console, Naver Search Advisor and IndexNow monitoring.

CREATE TABLE IF NOT EXISTS seo_crawler_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_name VARCHAR(64) NOT NULL,
    path VARCHAR(512) NOT NULL,
    status_code INTEGER NOT NULL DEFAULT 200,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    ip_address VARCHAR(128) NOT NULL DEFAULT '',
    user_agent TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seo_crawler_logs_created_at ON seo_crawler_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_crawler_logs_path ON seo_crawler_logs (path);
CREATE INDEX IF NOT EXISTS idx_seo_crawler_logs_bot ON seo_crawler_logs (bot_name);
