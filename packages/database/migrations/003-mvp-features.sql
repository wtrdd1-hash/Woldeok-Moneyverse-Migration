DO $$
BEGIN
  CREATE TYPE admin_role AS ENUM ('operator','approver','server_operator');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS user_roles (user_id uuid NOT NULL REFERENCES users(id), role admin_role NOT NULL, granted_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,role));
CREATE TABLE IF NOT EXISTS daily_rewards (user_id uuid NOT NULL REFERENCES users(id), reward_date date NOT NULL, transaction_id uuid REFERENCES ledger_transactions(id), PRIMARY KEY(user_id,reward_date));
CREATE TABLE IF NOT EXISTS work_rewards (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id), idempotency_key uuid NOT NULL UNIQUE, transaction_id uuid REFERENCES ledger_transactions(id), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS shop_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, description text NOT NULL, price bigint NOT NULL CHECK(price>0), active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS purchases (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id), item_id uuid NOT NULL REFERENCES shop_items(id), transaction_id uuid NOT NULL REFERENCES ledger_transactions(id), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS announcements (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, body text NOT NULL, published_at timestamptz, created_by uuid REFERENCES users(id));
CREATE TABLE IF NOT EXISTS photos (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), storage_key text NOT NULL UNIQUE, alt_text text NOT NULL, visibility text NOT NULL CHECK(visibility IN ('public','private')), uploaded_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS admin_approval_requests (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), requester_id uuid NOT NULL REFERENCES users(id), approver_id uuid REFERENCES users(id), action text NOT NULL, payload jsonb NOT NULL, status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','executed')), created_at timestamptz NOT NULL DEFAULT now(), CHECK(requester_id IS DISTINCT FROM approver_id));
CREATE TABLE IF NOT EXISTS minecraft_operations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_user_id uuid REFERENCES users(id), action text NOT NULL CHECK(action IN ('status','start','stop','restart','logs')), result text, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,UPDATE ON user_roles,daily_rewards,work_rewards,shop_items,purchases,announcements,photos,admin_approval_requests,minecraft_operations TO moneyverse_app;
