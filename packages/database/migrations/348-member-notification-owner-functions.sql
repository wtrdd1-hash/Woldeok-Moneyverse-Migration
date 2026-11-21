-- v2026.11.18.22: notification source parity and owner-scoped read/write procedures.
-- No real records copied, no ledger/account changes. SECURITY DEFINER with fixed search_path.
BEGIN;

CREATE TABLE IF NOT EXISTS public.in_app_notifications (
    id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category text NOT NULL CHECK (category IN (
      'SECURITY_CRITICAL','TRANSACTIONAL','SERVICE_OPERATIONAL','PRODUCT_ACTIVITY',
      'SEASON_LIVEOPS','REACTIVATION','MARKETING_COMMERCIAL'
    )),
    title text NOT NULL,
    body text NOT NULL,
    link text,
    dedupe_key text,
    is_read boolean NOT NULL DEFAULT false,
    read_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT pg_catalog.now()
);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_user_created_v22
    ON public.in_app_notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_user_unread_v22
    ON public.in_app_notifications(user_id, is_read, created_at DESC);

CREATE OR REPLACE FUNCTION public.member_notifications_list(p_actor uuid, p_limit integer, p_unread_only boolean)
RETURNS TABLE(id uuid, user_id uuid, category text, title text, body text, link text,
              dedupe_key text, is_read boolean, read_at timestamptz, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'pg_catalog','pg_temp' AS $function$
BEGIN
    IF p_actor IS NULL OR NOT EXISTS (
      SELECT 1 FROM public.users AS u WHERE u.id=p_actor AND u.status='active'::public.user_status
    ) THEN
      RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='active owner required';
    END IF;
    RETURN QUERY SELECT n.id,n.user_id,n.category,n.title,n.body,n.link,n.dedupe_key,
                        n.is_read,n.read_at,n.created_at
       FROM public.in_app_notifications AS n
       WHERE n.user_id=p_actor AND (NOT coalesce(p_unread_only,false) OR NOT n.is_read)
       ORDER BY n.created_at DESC,n.id DESC
       LIMIT least(greatest(coalesce(p_limit,50),1),100);
END;
$function$;

CREATE OR REPLACE FUNCTION public.member_notifications_unread_count(p_actor uuid)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'pg_catalog','pg_temp' AS $function$
BEGIN
    IF p_actor IS NULL OR NOT EXISTS (
      SELECT 1 FROM public.users AS u WHERE u.id=p_actor AND u.status='active'::public.user_status
    ) THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='active owner required'; END IF;
    RETURN (SELECT count(*)::integer FROM public.in_app_notifications AS n
            WHERE n.user_id=p_actor AND NOT n.is_read);
END;
$function$;

CREATE OR REPLACE FUNCTION public.member_notifications_total_count(p_actor uuid)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'pg_catalog','pg_temp' AS $function$
BEGIN
    IF p_actor IS NULL OR NOT EXISTS (
      SELECT 1 FROM public.users AS u WHERE u.id=p_actor AND u.status='active'::public.user_status
    ) THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='active owner required'; END IF;
    RETURN (SELECT count(*)::integer FROM public.in_app_notifications AS n WHERE n.user_id=p_actor);
END;
$function$;

CREATE OR REPLACE FUNCTION public.member_notification_mark_read(p_actor uuid,p_notification uuid)
RETURNS TABLE(id uuid, is_read boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'pg_catalog','pg_temp' AS $function$
BEGIN
    IF p_actor IS NULL OR NOT EXISTS (
      SELECT 1 FROM public.users AS u WHERE u.id=p_actor AND u.status='active'::public.user_status
    ) THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='active owner required'; END IF;
    RETURN QUERY UPDATE public.in_app_notifications AS n
      SET is_read=true, read_at=pg_catalog.now()
      WHERE n.id=p_notification AND n.user_id=p_actor
      RETURNING n.id, n.is_read;
END;
$function$;

CREATE OR REPLACE FUNCTION public.member_notification_mark_all_read(p_actor uuid)
RETURNS TABLE(updated_count integer, unread_count integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'pg_catalog','pg_temp' AS $function$
DECLARE v_updated integer;
BEGIN
    IF p_actor IS NULL OR NOT EXISTS (
      SELECT 1 FROM public.users AS u WHERE u.id=p_actor AND u.status='active'::public.user_status
    ) THEN RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='active owner required'; END IF;
    UPDATE public.in_app_notifications AS n
      SET is_read=true, read_at=pg_catalog.now()
      WHERE n.user_id=p_actor AND NOT n.is_read;
    GET DIAGNOSTICS v_updated=ROW_COUNT;
    RETURN QUERY SELECT v_updated,
      (SELECT count(*)::integer FROM public.in_app_notifications AS n
       WHERE n.user_id=p_actor AND NOT n.is_read);
END;
$function$;

REVOKE ALL ON FUNCTION public.member_notifications_list(uuid,integer,boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.member_notifications_unread_count(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.member_notifications_total_count(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.member_notification_mark_read(uuid,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.member_notification_mark_all_read(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.member_notifications_list(uuid,integer,boolean) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.member_notifications_unread_count(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.member_notifications_total_count(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.member_notification_mark_read(uuid,uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.member_notification_mark_all_read(uuid) TO moneyverse_app;
COMMIT;
