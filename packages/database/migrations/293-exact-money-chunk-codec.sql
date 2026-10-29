-- v2026.10.29.1201: additive exact JSONB money codec, no ledger balance changes.
-- NUMERIC remains authoritative; chunk transport avoids JS IEEE-754 truncation.
BEGIN;
CREATE OR REPLACE FUNCTION public.money_to_chunks(p_amount numeric)
RETURNS jsonb LANGUAGE plpgsql IMMUTABLE STRICT SET search_path = pg_catalog, pg_temp AS $$
DECLARE v numeric := abs(p_amount); v_parts jsonb := '[]'::jsonb; v_chunk numeric; v_count integer := 0;
BEGIN
 IF p_amount <> trunc(p_amount) THEN RAISE EXCEPTION 'money amount must be integral' USING ERRCODE='22003'; END IF;
 LOOP
  v_chunk := mod(v, 1000000000);
  v_parts := jsonb_build_array(v_chunk::integer) || v_parts;
  v := trunc(v / 1000000000);
  v_count := v_count + 1;
  IF v_count > 100 THEN RAISE EXCEPTION 'money amount exceeds 100 chunks' USING ERRCODE='22003'; END IF;
  EXIT WHEN v = 0;
 END LOOP;
 RETURN jsonb_build_object('version',1,'base',1000000000,'negative',p_amount < 0,'chunks',v_parts);
END $$;
CREATE OR REPLACE FUNCTION public.money_from_chunks(p_payload jsonb)
RETURNS numeric LANGUAGE plpgsql IMMUTABLE STRICT SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_array jsonb; v_part jsonb; v_amount numeric := 0; v_n numeric; v_count integer;
BEGIN
 IF jsonb_typeof(p_payload) <> 'object' OR p_payload->'version' <> '1'::jsonb OR p_payload->'base' <> '1000000000'::jsonb OR jsonb_typeof(p_payload->'negative') <> 'boolean' THEN
  RAISE EXCEPTION 'invalid money chunk header' USING ERRCODE='22023';
 END IF;
 v_array := p_payload->'chunks';
 IF jsonb_typeof(v_array) <> 'array' THEN RAISE EXCEPTION 'invalid money chunks' USING ERRCODE='22023'; END IF;
 v_count := jsonb_array_length(v_array);
 IF v_count < 1 OR v_count > 100 THEN RAISE EXCEPTION 'money chunk count invalid' USING ERRCODE='22023'; END IF;
 FOR v_part IN SELECT value FROM jsonb_array_elements(v_array) LOOP
  IF jsonb_typeof(v_part) <> 'number' OR v_part::text !~ '^(0|[1-9][0-9]{0,8})$' THEN
   RAISE EXCEPTION 'money chunk must be an integer 0..999999999' USING ERRCODE='22023';
  END IF;
  v_n := (v_part::text)::numeric;
  v_amount := v_amount * 1000000000 + v_n;
 END LOOP;
 IF v_count > 1 AND (v_array->0)::text = '0' THEN RAISE EXCEPTION 'leading zero chunk' USING ERRCODE='22023'; END IF;
 IF v_amount = 0 AND p_payload->>'negative' = 'true' THEN RAISE EXCEPTION 'negative zero' USING ERRCODE='22023'; END IF;
 IF p_payload->>'negative' = 'true' THEN RETURN -v_amount; END IF;
 RETURN v_amount;
END $$;
REVOKE ALL ON FUNCTION public.money_to_chunks(numeric) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.money_from_chunks(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.money_to_chunks(numeric) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.money_from_chunks(jsonb) TO moneyverse_app;
COMMIT;
