BEGIN;

CREATE TABLE public.business_boost_commands (
  idempotency_key uuid PRIMARY KEY,
  actor_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ownership_id uuid NOT NULL REFERENCES public.virtual_business_ownerships(id) ON DELETE CASCADE,
  boost_code text NOT NULL CHECK (btrim(boost_code) <> ''),
  result jsonb,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  completed_at timestamptz
);
ALTER TABLE public.business_boost_commands OWNER TO moneyverse_migrator;
REVOKE ALL ON TABLE public.business_boost_commands FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.business_apply_boost(
  p_idempotency_key uuid,
  p_actor uuid,
  p_ownership_id uuid,
  p_boost_code text
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_command record;
  v_ownership record;
  v_user_item record;
  v_boost_data jsonb;
  v_boost_name text;
BEGIN
  INSERT INTO public.business_boost_commands(idempotency_key, actor_user_id, ownership_id, boost_code)
  VALUES (p_idempotency_key, p_actor, p_ownership_id, p_boost_code)
  ON CONFLICT (idempotency_key) DO NOTHING;
  SELECT * INTO v_command FROM public.business_boost_commands
  WHERE idempotency_key = p_idempotency_key FOR UPDATE;
  IF v_command.actor_user_id <> p_actor OR v_command.ownership_id <> p_ownership_id OR v_command.boost_code <> p_boost_code THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'idempotency key was reused with a different business boost command';
  END IF;
  IF v_command.result IS NOT NULL THEN
    RETURN v_command.result;
  END IF;

  SELECT * INTO v_ownership FROM public.virtual_business_ownerships
  WHERE id = p_ownership_id AND user_id = p_actor FOR UPDATE;
  IF v_ownership IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'business ownership not found';
  END IF;

  SELECT ui.*, sc.id AS sc_id INTO v_user_item
  FROM public.user_items ui JOIN public.shop_catalog sc ON sc.id = ui.catalog_id
  WHERE ui.user_id = p_actor AND sc.code = p_boost_code AND ui.quantity > 0 FOR UPDATE;
  IF v_user_item IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'boost item not owned by user';
  END IF;

  UPDATE public.user_items SET quantity = quantity - 1 WHERE id = v_user_item.id;

  IF p_boost_code = 'biz_cvs_boost_7d' THEN
    v_boost_name := '매출 1.2배 부스트(7일)';
    v_boost_data := jsonb_build_object('code', p_boost_code, 'name', v_boost_name, 'revenue_mult', 1.2, 'cost_mult', 1.0, 'expires_at', (clock_timestamp() + interval '7 days'));
  ELSIF p_boost_code = 'biz_farm_fertilizer' THEN
    v_boost_name := '급속 비료(매출 1.25배)';
    v_boost_data := jsonb_build_object('code', p_boost_code, 'name', v_boost_name, 'revenue_mult', 1.25, 'cost_mult', 1.0, 'expires_at', (clock_timestamp() + interval '7 days'));
  ELSIF p_boost_code = 'biz_truck_tuning' THEN
    v_boost_name := '엔진 튜닝(운영비 30% 감면)';
    v_boost_data := jsonb_build_object('code', p_boost_code, 'name', v_boost_name, 'revenue_mult', 1.0, 'cost_mult', 0.7, 'expires_at', (clock_timestamp() + interval '7 days'));
  ELSIF p_boost_code = 'biz_manager_auto' THEN
    v_boost_name := '매니저 자동 정비(운영비 20% 감면)';
    v_boost_data := jsonb_build_object('code', p_boost_code, 'name', v_boost_name, 'revenue_mult', 1.0, 'cost_mult', 0.8, 'expires_at', (clock_timestamp() + interval '30 days'));
  ELSIF p_boost_code = 'biz_tax_relief' THEN
    v_boost_name := '사업 세금 감면권(비용 50% 절감)';
    v_boost_data := jsonb_build_object('code', p_boost_code, 'name', v_boost_name, 'revenue_mult', 1.0, 'cost_mult', 0.5, 'expires_at', (clock_timestamp() + interval '14 days'));
  ELSE
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unrecognized boost item code';
  END IF;

  UPDATE public.virtual_business_ownerships SET boost_active = v_boost_data WHERE id = p_ownership_id;
  UPDATE public.business_boost_commands SET result = v_boost_data, completed_at = clock_timestamp()
  WHERE idempotency_key = p_idempotency_key;
  RETURN v_boost_data;
END;
$$;

ALTER FUNCTION public.business_apply_boost(uuid, uuid, uuid, text) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.business_apply_boost(uuid, uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.business_apply_boost(uuid, uuid, uuid, text) TO moneyverse_app;
REVOKE ALL ON FUNCTION public.business_apply_boost(uuid, uuid, text) FROM PUBLIC, moneyverse_app;

COMMIT;