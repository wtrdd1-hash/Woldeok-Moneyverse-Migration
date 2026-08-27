-- Seasonal community events are game-only sinks. Points have no exchange
-- value and are deliberately kept separate from WLD balances.
CREATE TABLE IF NOT EXISTS public.virtual_seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL CHECK (ends_at > starts_at),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS virtual_seasons_one_active ON public.virtual_seasons((active)) WHERE active;

CREATE TABLE IF NOT EXISTS public.virtual_consumption_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES public.virtual_seasons(id),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 500),
  cost_wld bigint NOT NULL CHECK (cost_wld BETWEEN 1 AND 100000),
  points_per_entry integer NOT NULL CHECK (points_per_entry BETWEEN 1 AND 10000),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.virtual_consumption_event_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key uuid NOT NULL UNIQUE,
  event_id uuid NOT NULL REFERENCES public.virtual_consumption_events(id),
  user_id uuid NOT NULL REFERENCES public.users(id),
  quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 100),
  points_earned bigint NOT NULL CHECK (points_earned > 0),
  transaction_id uuid NOT NULL REFERENCES public.ledger_transactions(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS virtual_event_entries_event_user_idx ON public.virtual_consumption_event_entries(event_id,user_id);

INSERT INTO public.virtual_seasons(name,starts_at,ends_at,active)
SELECT '2026 여름 커뮤니티 시즌',date_trunc('day',clock_timestamp()),date_trunc('day',clock_timestamp()) + interval '31 days',true
WHERE NOT EXISTS (SELECT 1 FROM public.virtual_seasons WHERE active);
INSERT INTO public.virtual_consumption_events(season_id,title,description,cost_wld,points_per_entry)
SELECT season.id,'커뮤니티 축제 부스','게임 내 WLD를 소비해 시즌 점수를 얻는 커뮤니티 이벤트입니다.',100,10 FROM public.virtual_seasons AS season
WHERE season.active AND NOT EXISTS (SELECT 1 FROM public.virtual_consumption_events AS event WHERE event.season_id=season.id AND event.title='커뮤니티 축제 부스');

CREATE OR REPLACE FUNCTION public.season_active_events()
RETURNS TABLE(event_id uuid, season_id uuid, season_name text, title text, description text, cost_wld bigint, points_per_entry integer, ends_at timestamptz)
LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
 SELECT event.id,season.id,season.name,event.title,event.description,event.cost_wld,event.points_per_entry,season.ends_at
 FROM public.virtual_consumption_events AS event JOIN public.virtual_seasons AS season ON season.id=event.season_id
 WHERE event.active AND season.active AND season.starts_at<=clock_timestamp() AND season.ends_at>clock_timestamp() ORDER BY event.created_at,event.id
$$;
CREATE OR REPLACE FUNCTION public.season_event_leaderboard(p_event uuid, p_limit integer DEFAULT 20)
RETURNS TABLE(rank bigint, points bigint, entries bigint, display_name text)
LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
 WITH totals AS (SELECT entry.user_id,sum(entry.points_earned)::bigint AS points,count(*)::bigint AS entries FROM public.virtual_consumption_event_entries AS entry WHERE entry.event_id=p_event GROUP BY entry.user_id), ranked AS (SELECT totals.*,dense_rank() OVER (ORDER BY totals.points DESC,totals.entries ASC,totals.user_id) AS rank FROM totals)
 SELECT ranked.rank,ranked.points,ranked.entries,coalesce(identity.display_name,'참여자') FROM ranked LEFT JOIN LATERAL (SELECT display_name FROM public.identities WHERE user_id=ranked.user_id ORDER BY linked_at LIMIT 1) AS identity ON true ORDER BY ranked.rank LIMIT greatest(1,least(p_limit,50))
$$;
CREATE OR REPLACE FUNCTION public.season_consume(p_key uuid,p_actor uuid,p_event uuid,p_quantity integer)
RETURNS TABLE(event_id uuid, points_earned bigint, transaction_id uuid, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE v_cost bigint; v_points integer; v_cash uuid; v_sink uuid; v_tx uuid;
BEGIN
 IF p_key IS NULL OR p_actor IS NULL OR p_event IS NULL OR p_quantity < 1 OR p_quantity > 100 THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='invalid event entry'; END IF;
 SELECT entry.event_id,entry.points_earned,entry.transaction_id INTO event_id,points_earned,transaction_id FROM public.virtual_consumption_event_entries AS entry WHERE entry.idempotency_key=p_key;
 IF FOUND THEN replayed:=true; RETURN NEXT; RETURN; END IF;
 SELECT event.cost_wld,event.points_per_entry INTO v_cost,v_points FROM public.virtual_consumption_events AS event JOIN public.virtual_seasons AS season ON season.id=event.season_id WHERE event.id=p_event AND event.active AND season.active AND season.starts_at<=clock_timestamp() AND season.ends_at>clock_timestamp() FOR KEY SHARE OF event,season;
 IF v_cost IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='event is unavailable'; END IF;
 SELECT id INTO v_cash FROM public.accounts WHERE owner_user_id=p_actor AND account_type='USER_CASH'::public.account_type AND status='active'::public.account_status FOR UPDATE;
 SELECT id INTO v_sink FROM public.accounts WHERE system_key='sink' AND account_type='SINK'::public.account_type AND status='active'::public.account_status FOR UPDATE;
 IF v_cash IS NULL OR v_sink IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='active event accounts required'; END IF;
 SELECT public.economy_post_transaction(p_key,'CONSUMPTION_EVENT',p_actor,NULL,jsonb_build_array(jsonb_build_object('accountId',v_cash,'amount',v_cost*p_quantity,'direction','credit'),jsonb_build_object('accountId',v_sink,'amount',v_cost*p_quantity,'direction','debit')),'season.event.consumed',jsonb_build_object('eventId',p_event,'quantity',p_quantity,'points',v_points*p_quantity)) INTO v_tx;
 INSERT INTO public.virtual_consumption_event_entries(idempotency_key,event_id,user_id,quantity,points_earned,transaction_id) VALUES(p_key,p_event,p_actor,p_quantity,v_points*p_quantity,v_tx);
 RETURN QUERY SELECT p_event,(v_points*p_quantity)::bigint,v_tx,false;
END;
$$;
ALTER FUNCTION public.season_active_events() OWNER TO moneyverse_migrator; ALTER FUNCTION public.season_event_leaderboard(uuid,integer) OWNER TO moneyverse_migrator; ALTER FUNCTION public.season_consume(uuid,uuid,uuid,integer) OWNER TO moneyverse_migrator;
REVOKE ALL ON public.virtual_seasons,public.virtual_consumption_events,public.virtual_consumption_event_entries FROM PUBLIC,moneyverse_app;
REVOKE ALL ON FUNCTION public.season_active_events(),public.season_event_leaderboard(uuid,integer),public.season_consume(uuid,uuid,uuid,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.season_active_events(),public.season_event_leaderboard(uuid,integer),public.season_consume(uuid,uuid,uuid,integer) TO moneyverse_app;
