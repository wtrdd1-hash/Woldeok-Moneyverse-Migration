BEGIN;

CREATE TABLE public.member_board_stock_context (
  post_id uuid PRIMARY KEY REFERENCES public.member_board_posts(id) ON DELETE CASCADE,
  stock_id uuid NOT NULL REFERENCES public.virtual_stocks(id),
  category text NOT NULL CHECK (category IN ('analysis','question','journal','business','system')),
  stance text NOT NULL CHECK (stance IN ('bullish','neutral','bearish','none')),
  position_disclosure text NOT NULL CHECK (position_disclosure IN ('holder','no_position','operator_related','undisclosed')),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

CREATE INDEX member_board_stock_context_stock_idx
  ON public.member_board_stock_context(stock_id, created_at DESC, post_id DESC);

REVOKE ALL PRIVILEGES ON TABLE public.member_board_stock_context FROM PUBLIC, moneyverse_app;

CREATE FUNCTION public.member_board_create_stock_tagged(
  p_actor uuid, p_title text, p_body text, p_key uuid,
  p_image_storage_key text, p_image_alt_text text,
  p_stock_symbol text, p_category text, p_stance text, p_position_disclosure text
)
RETURNS TABLE(
  post_id uuid, title text, body text, author_name text, created_at timestamptz,
  updated_at timestamptz, mine boolean, image_storage_key text, image_alt_text text,
  primary_stock_id uuid, stock_symbol text, stock_name text, category text,
  stance text, position_disclosure text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_post record;
  v_stock_id uuid;
  v_existing public.member_board_stock_context%ROWTYPE;
BEGIN
  IF p_stock_symbol IS NULL OR p_stock_symbol !~ '^[A-Za-z0-9._-]{1,16}$'
    OR p_category NOT IN ('analysis','question','journal','business','system')
    OR p_stance NOT IN ('bullish','neutral','bearish','none')
    OR p_position_disclosure NOT IN ('holder','no_position','operator_related','undisclosed')
    OR (p_category = 'analysis' AND p_position_disclosure = 'undisclosed') THEN
    RAISE EXCEPTION USING ERRCODE='22023';
  END IF;

  SELECT s.id INTO v_stock_id
  FROM public.virtual_stocks s
  WHERE s.active AND pg_catalog.upper(s.symbol)=pg_catalog.upper(p_stock_symbol)
  LIMIT 1;
  IF v_stock_id IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023'; END IF;

  SELECT * INTO v_post
  FROM public.member_board_create_with_image(
    p_actor,p_title,p_body,p_key,p_image_storage_key,p_image_alt_text
  );

  INSERT INTO public.member_board_stock_context(post_id,stock_id,category,stance,position_disclosure)
  VALUES(v_post.post_id,v_stock_id,p_category,p_stance,p_position_disclosure)
  ON CONFLICT (post_id) DO NOTHING;

  SELECT * INTO v_existing FROM public.member_board_stock_context WHERE post_id=v_post.post_id;
  IF v_existing.stock_id<>v_stock_id OR v_existing.category<>p_category
    OR v_existing.stance<>p_stance OR v_existing.position_disclosure<>p_position_disclosure THEN
    RAISE EXCEPTION USING ERRCODE='22023';
  END IF;

  RETURN QUERY
  SELECT v_post.post_id,v_post.title,v_post.body,v_post.author_name,v_post.created_at,
    v_post.updated_at,v_post.mine,v_post.image_storage_key,v_post.image_alt_text,
    c.stock_id,s.symbol,s.name,c.category,c.stance,c.position_disclosure
  FROM public.member_board_stock_context c
  JOIN public.virtual_stocks s ON s.id=c.stock_id
  WHERE c.post_id=v_post.post_id;
END;
$$;

CREATE FUNCTION public.member_board_public_list_with_stock(p_limit integer)
RETURNS TABLE(
  post_id uuid, title text, author_name text, created_at timestamptz,
  updated_at timestamptz, comment_count bigint, mine boolean,
  image_storage_key text, image_alt_text text,
  primary_stock_id uuid, stock_symbol text, stock_name text, category text,
  stance text, position_disclosure text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT b.post_id,b.title,b.author_name,b.created_at,b.updated_at,b.comment_count,b.mine,
    b.image_storage_key,b.image_alt_text,c.stock_id,s.symbol,s.name,c.category,c.stance,c.position_disclosure
  FROM public.member_board_public_list(p_limit) b
  LEFT JOIN public.member_board_stock_context c ON c.post_id=b.post_id
  LEFT JOIN public.virtual_stocks s ON s.id=c.stock_id
$$;

ALTER FUNCTION public.member_board_create_stock_tagged(uuid,text,text,uuid,text,text,text,text,text,text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_board_public_list_with_stock(integer) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.member_board_create_stock_tagged(uuid,text,text,uuid,text,text,text,text,text,text),public.member_board_public_list_with_stock(integer) FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.member_board_create_stock_tagged(uuid,text,text,uuid,text,text,text,text,text,text),public.member_board_public_list_with_stock(integer) TO moneyverse_app;

COMMIT;
