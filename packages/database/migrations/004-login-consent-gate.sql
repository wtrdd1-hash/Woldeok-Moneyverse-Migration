ALTER TABLE auth_sessions ADD COLUMN IF NOT EXISTS prelogin_consent_version_id uuid REFERENCES consent_versions(id);
ALTER TABLE auth_sessions ADD COLUMN IF NOT EXISTS prelogin_age_confirmed boolean NOT NULL DEFAULT false;
ALTER TABLE auth_sessions ADD COLUMN IF NOT EXISTS prelogin_consented_at timestamptz;
INSERT INTO consent_versions (terms_version, privacy_version, published_at)
VALUES ('2026-08-26', '2026-08-26', now()) ON CONFLICT (terms_version, privacy_version) DO NOTHING;
GRANT SELECT ON consent_versions TO moneyverse_app;
