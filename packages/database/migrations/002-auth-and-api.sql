CREATE TABLE IF NOT EXISTS auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  csrf_hash text NOT NULL,
  user_id uuid REFERENCES users(id),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS auth_sessions_active_token ON auth_sessions(token_hash) WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS oauth_challenges (
  state_hash text PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES auth_sessions(id) ON DELETE CASCADE,
  provider identity_provider NOT NULL,
  code_verifier text NOT NULL,
  nonce text NOT NULL,
  redirect_uri text NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON auth_sessions, oauth_challenges TO moneyverse_app;
