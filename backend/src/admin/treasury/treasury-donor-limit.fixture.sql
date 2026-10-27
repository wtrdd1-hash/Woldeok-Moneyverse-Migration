-- Synthetic isolated PostgreSQL fixture ONLY. Never apply to service databases.
CREATE ROLE moneyverse_app LOGIN;
CREATE TABLE public.users (
  id uuid PRIMARY KEY,
  username text NOT NULL,
  nickname text NOT NULL
);
CREATE TABLE public.treasury_donations (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id),
  amount_wld bigint NOT NULL,
  honor_title text,
  created_at timestamptz NOT NULL
);
INSERT INTO public.users(id, username, nickname) VALUES
('11111111-2222-4333-8444-555555555551', 'synthetic_a', 'Synthetic A'),
('11111111-2222-4333-8444-555555555552', 'synthetic_b', 'Synthetic B');
INSERT INTO public.treasury_donations(user_id, amount_wld, honor_title, created_at) VALUES
('11111111-2222-4333-8444-555555555551', 9007199254740993, 'Synthetic donor', '2026-01-01'),
('11111111-2222-4333-8444-555555555552', 9007199254740993, 'Synthetic donor', '2026-01-02');
REVOKE ALL ON public.users, public.treasury_donations FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO moneyverse_app;
GRANT SELECT ON public.users, public.treasury_donations TO moneyverse_app;
