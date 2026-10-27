SET ROLE moneyverse_app;
DO $$
DECLARE
  v_actor uuid:='00000000-0000-0000-0000-000000000001';
  v_approver uuid:='00000000-0000-0000-0000-000000000002';
  v_author_session uuid:='00000000-0000-0000-0000-000000000010';
  v_approver_session uuid:='00000000-0000-0000-0000-000000000020';
  v_create_key uuid:='00000000-0000-0000-0000-000000000101';
  v_publish_key uuid:='00000000-0000-0000-0000-000000000102';
  v_retract_key uuid:='00000000-0000-0000-0000-000000000103';
  v_id uuid; v_replay uuid; v_reviewed timestamptz:=now()+interval '1 day';
BEGIN
  BEGIN
    PERFORM public.help_admin_create_draft(v_actor,'00000000-0000-0000-0000-000000000099',v_create_key,
      'ko','test-safe-help','account','검증 안내','검증 요약','검증 본문','https://example.org/source',repeat('b',64),v_reviewed);
    RAISE EXCEPTION 'forged admin session accepted';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS forged admin session denied';
  END;
  v_id := public.help_admin_create_draft(v_actor,v_author_session,v_create_key,
    'ko','test-safe-help','account','검증 안내','검증 요약','검증 본문','https://example.org/source',repeat('b',64),v_reviewed);
  -- Source review timestamp is part of the idempotency digest: exact replay needs identical timestamp.
  IF v_id IS NULL THEN RAISE EXCEPTION 'draft creation failed'; END IF;
  v_replay := public.help_admin_create_draft(v_actor,v_author_session,v_create_key,
    'ko','test-safe-help','account','검증 안내','검증 요약','검증 본문','https://example.org/source',repeat('b',64),v_reviewed);
  IF v_replay IS DISTINCT FROM v_id THEN RAISE EXCEPTION 'draft replay changed receipt'; END IF;
  IF (SELECT count(*) FROM public.help_public_article('ko','test-safe-help')) <> 0 THEN
    RAISE EXCEPTION 'draft leaked to public';
  END IF;
  BEGIN
    PERFORM public.help_admin_publish(v_actor,v_author_session,v_publish_key,v_id,1);
    RAISE EXCEPTION 'author self-approval accepted';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS author self-approval denied';
  END;
  v_replay := public.help_admin_publish(v_approver,v_approver_session,v_publish_key,v_id,1);
  IF v_replay IS DISTINCT FROM v_id THEN RAISE EXCEPTION 'publication did not return article'; END IF;
  IF (SELECT count(*) FROM public.help_public_article('ko','test-safe-help')) <> 1 THEN
    RAISE EXCEPTION 'independently published article not visible';
  END IF;
  v_replay := public.help_admin_publish(v_approver,v_approver_session,v_publish_key,v_id,1);
  IF v_replay IS DISTINCT FROM v_id THEN RAISE EXCEPTION 'publication replay changed receipt'; END IF;
  BEGIN
    PERFORM public.help_admin_publish(v_approver,v_approver_session,v_publish_key,v_id,2);
    RAISE EXCEPTION 'mismatched idempotency key accepted';
  EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'PASS mismatched publication replay denied';
  END;
  v_replay := public.help_admin_retract(v_approver,v_approver_session,v_retract_key,v_id,2);
  IF v_replay IS DISTINCT FROM v_id OR
    (SELECT count(*) FROM public.help_public_article('ko','test-safe-help')) <> 0 THEN
    RAISE EXCEPTION 'retraction leaked published article';
  END IF;
  v_replay := public.help_admin_retract(v_approver,v_approver_session,v_retract_key,v_id,2);
  IF v_replay IS DISTINCT FROM v_id THEN RAISE EXCEPTION 'retraction replay changed receipt'; END IF;
  RAISE NOTICE 'PASS operator draft, independent publication, original replay, retraction and no public leak';
END $$;
RESET ROLE;
DO $$ BEGIN
  IF (SELECT count(*) FROM public.help_article_events WHERE article_id=(SELECT id FROM public.help_articles WHERE slug='test-safe-help')) <> 3 THEN
    RAISE EXCEPTION 'expected exactly 3 immutable event receipts';
  END IF;
  RAISE NOTICE 'PASS exactly 3 immutable event receipts';
END $$;
DO $$ BEGIN
  BEGIN
    UPDATE public.help_article_events SET event_kind='draft_created';
    RAISE EXCEPTION 'audit events were mutable';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS immutable audit events';
  END;
  BEGIN
    UPDATE public.help_article_revisions SET body_plain='forged text';
    RAISE EXCEPTION 'approved source content was mutable';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS immutable revision content';
  END;
END $$;
