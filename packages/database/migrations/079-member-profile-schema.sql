BEGIN;

CREATE TYPE public.profile_visibility AS ENUM ('public', 'members', 'private');
CREATE TABLE public.member_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.users(id),
  visibility public.profile_visibility NOT NULL DEFAULT 'members',
  display_name text CHECK (char_length(display_name) BETWEEN 1 AND 80),
  image_url text CHECK (image_url IS NULL OR char_length(image_url) <= 2048),
  field_visibility jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(field_visibility) = 'object'),
  featured_title text CHECK (featured_title IS NULL OR char_length(featured_title) <= 80),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE public.member_titles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE CHECK (code ~ '^[a-z0-9_]{3,64}$'),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80), created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE public.user_titles (
  user_id uuid NOT NULL REFERENCES public.users(id), title_id uuid NOT NULL REFERENCES public.member_titles(id),
  awarded_at timestamptz NOT NULL DEFAULT clock_timestamp(), PRIMARY KEY (user_id, title_id)
);
CREATE TABLE public.casino_self_limits (
  user_id uuid PRIMARY KEY REFERENCES public.users(id), daily_bet_limit bigint NOT NULL CHECK (daily_bet_limit >= 0),
  daily_loss_limit bigint NOT NULL CHECK (daily_loss_limit >= 0), locked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
INSERT INTO public.member_titles(code, name) VALUES ('starter', 'Starter'), ('helper', 'Helper'), ('season_honour', 'Season honour') ON CONFLICT (code) DO NOTHING;
REVOKE ALL PRIVILEGES ON TABLE public.member_profiles, public.member_titles, public.user_titles, public.casino_self_limits FROM PUBLIC, moneyverse_app;

COMMIT;
