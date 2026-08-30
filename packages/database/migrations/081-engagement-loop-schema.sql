BEGIN;

CREATE TABLE public.engagement_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE CHECK (code ~ '^[a-z0-9_]{3,64}$'),
  kind text NOT NULL CHECK (kind IN ('quest', 'daily', 'weekly', 'npc_order', 'collection', 'returning')),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120), requirements jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(requirements) = 'object'),
  reward jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(reward) = 'object'), active boolean NOT NULL DEFAULT true
);
CREATE TABLE public.engagement_progress (
  user_id uuid NOT NULL REFERENCES public.users(id), catalog_id uuid NOT NULL REFERENCES public.engagement_catalog(id),
  period_key text NOT NULL CHECK (char_length(period_key) BETWEEN 1 AND 32), progress integer NOT NULL DEFAULT 0 CHECK (progress >= 0),
  completed_at timestamptz, PRIMARY KEY(user_id, catalog_id, period_key)
);
-- Progress is recorded with an idempotency key, like every other command in
-- this schema: a retried request must not count twice.
CREATE TABLE public.engagement_progress_receipts (
  idempotency_key uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES public.users(id),
  catalog_id uuid NOT NULL REFERENCES public.engagement_catalog(id),
  period_key text NOT NULL, amount integer NOT NULL CHECK (amount > 0),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE public.npc_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE CHECK (code ~ '^[a-z0-9_]{3,64}$'), name text NOT NULL, card jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(card) = 'object'), active boolean NOT NULL DEFAULT true
);
CREATE TABLE public.npc_relationships (user_id uuid NOT NULL REFERENCES public.users(id), npc_id uuid NOT NULL REFERENCES public.npc_profiles(id), affinity integer NOT NULL DEFAULT 0 CHECK (affinity >= 0), PRIMARY KEY(user_id, npc_id));
CREATE TABLE public.collection_entries (user_id uuid NOT NULL REFERENCES public.users(id), collection_code text NOT NULL, entry_code text NOT NULL, unlocked_at timestamptz NOT NULL DEFAULT clock_timestamp(), PRIMARY KEY(user_id, collection_code, entry_code));
CREATE TABLE public.member_engagement_preferences (user_id uuid PRIMARY KEY REFERENCES public.users(id), notifications_enabled boolean NOT NULL DEFAULT true, updated_at timestamptz NOT NULL DEFAULT clock_timestamp());
CREATE TABLE public.member_activity_signals (user_id uuid PRIMARY KEY REFERENCES public.users(id), last_work_at timestamptz, repeated_task_count integer NOT NULL DEFAULT 0, last_shop_purchase_at timestamptz, last_business_management_at timestamptz, updated_at timestamptz NOT NULL DEFAULT clock_timestamp());
ALTER TABLE public.virtual_seasons ADD COLUMN lifecycle_state text NOT NULL DEFAULT 'active' CHECK (lifecycle_state IN ('planned', 'active', 'closing', 'closed'));
ALTER TABLE public.virtual_seasons ADD COLUMN closed_at timestamptz;

INSERT INTO public.engagement_catalog(code, kind, title, requirements, reward) VALUES
  ('first_wage','quest','First wage','{"workCompletions":1}','{"title":"starter"}'),
  ('wise_spending','quest','Wise spending','{"shopPurchases":1}','{"item":"repair_kit"}'),
  ('neighbour_help','quest','Neighbour help','{"npcOrders":3}','{"decoration":"helper"}'),
  ('weekly_variety','weekly','Weekly variety','{"distinctTasks":3}','{"collection":"weekly"}'),
  ('return_day_1','returning','Return day one','{"workCompletions":1}','{"coupon":"returning"}')
ON CONFLICT (code) DO NOTHING;
INSERT INTO public.npc_profiles(code, name, card) VALUES
  ('market_keeper','Market keeper','{"role":"daily orders"}'), ('courier','Courier','{"role":"delivery requests"}')
ON CONFLICT (code) DO NOTHING;
REVOKE ALL PRIVILEGES ON TABLE public.engagement_catalog, public.engagement_progress,
  public.engagement_progress_receipts, public.npc_profiles,
  public.npc_relationships, public.collection_entries, public.member_engagement_preferences,
  public.member_activity_signals, public.virtual_seasons FROM PUBLIC, moneyverse_app;

COMMIT;
