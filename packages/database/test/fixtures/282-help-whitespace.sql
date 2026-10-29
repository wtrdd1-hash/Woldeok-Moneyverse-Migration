-- Run after 282-help-bootstrap.sql and 282-help-positive.sql in a disposable database.
-- NestJS normalizes the raw query; the immutable SECURITY DEFINER function
-- must match the resulting phrase and preserve its approved-only ACL boundary.
SET ROLE moneyverse_app;
DO $$ BEGIN
  IF (SELECT count(*) FROM public.help_public_search('ko', 'account', '로그인 도움말', 20)) <> 1 THEN
    RAISE EXCEPTION 'canonicalized help phrase failed approved-only search';
  END IF;
  IF (SELECT count(*) FROM public.help_public_search('ko', 'shop', '로그인 도움말', 20)) <> 0 THEN
    RAISE EXCEPTION 'canonicalized help phrase escaped category filter';
  END IF;
  IF (SELECT count(*) FROM public.help_public_search('ko', NULL, 'unapproved', 20)) <> 0 THEN
    RAISE EXCEPTION 'draft help article leaked';
  END IF;
END $$;
RESET ROLE;
