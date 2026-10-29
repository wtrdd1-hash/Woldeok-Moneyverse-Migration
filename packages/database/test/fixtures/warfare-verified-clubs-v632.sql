-- Synthetic fixture only. Apply exclusively to disposable mv-b-v632-club-pg.
CREATE ROLE moneyverse_app LOGIN;
CREATE TABLE public.users (id uuid PRIMARY KEY, display_name text NOT NULL);
CREATE TABLE public.clubs (
  id uuid PRIMARY KEY, tag text NOT NULL, name text NOT NULL,
  description text NOT NULL, owner_id uuid NOT NULL REFERENCES public.users(id),
  join_mode text NOT NULL, status text NOT NULL, level integer NOT NULL,
  experience bigint NOT NULL, member_count integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.club_members (
  club_id uuid NOT NULL REFERENCES public.clubs(id),
  user_id uuid NOT NULL REFERENCES public.users(id), role text NOT NULL,
  PRIMARY KEY (club_id,user_id)
);
INSERT INTO public.users (id,display_name) VALUES
('11111111-2222-4333-8444-555555555555','Alice'),
('66666666-7777-4888-8999-aaaaaaaaaaaa','Bob');
INSERT INTO public.clubs (id,tag,name,description,owner_id,join_mode,status,level,experience,member_count) VALUES
('aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee','ALICE','Alice Club','verified A','11111111-2222-4333-8444-555555555555','open','active',1,0,1),
('bbbbbbbb-cccc-4ddd-8eee-ffffffffffff','BOB','Bob Club','verified B','66666666-7777-4888-8999-aaaaaaaaaaaa','open','active',1,0,1);
INSERT INTO public.club_members (club_id,user_id,role) VALUES
('aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee','11111111-2222-4333-8444-555555555555','owner'),
('bbbbbbbb-cccc-4ddd-8eee-ffffffffffff','66666666-7777-4888-8999-aaaaaaaaaaaa','owner');
REVOKE ALL ON public.users,public.clubs,public.club_members FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO moneyverse_app;
GRANT SELECT ON public.users,public.clubs,public.club_members TO moneyverse_app;
