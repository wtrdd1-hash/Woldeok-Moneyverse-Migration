-- Run only in an ephemeral synthetic PostgreSQL database after migration 286.
\set ON_ERROR_STOP on
INSERT INTO public.users(id) VALUES
('11111111-1111-4111-8111-111111111111'),
('22222222-2222-4222-8222-222222222222'),
('33333333-3333-4333-8333-333333333333'),
('44444444-4444-4444-8444-444444444444');
SET ROLE moneyverse_app;
DO $$ BEGIN
  IF has_table_privilege('moneyverse_app','public.chat_media_registry','SELECT') OR has_table_privilege('moneyverse_app','public.chat_media_registry','INSERT') THEN RAISE EXCEPTION 'app role has direct table privileges'; END IF;
  IF NOT public.chat_media_register('11111111-1111-4111-8111-111111111111','chat_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png') THEN RAISE EXCEPTION 'owner registration failed'; END IF;
  IF public.chat_media_register('33333333-3333-4333-8333-333333333333','chat_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png') THEN RAISE EXCEPTION 'foreign owner hijacked key'; END IF;
  IF NOT public.chat_media_visible('11111111-1111-4111-8111-111111111111','chat_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png') THEN RAISE EXCEPTION 'owner cannot see upload'; END IF;
  IF public.chat_media_visible('22222222-2222-4222-8222-222222222222','chat_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png') THEN RAISE EXCEPTION 'unattached media visible to peer'; END IF;
  IF public.chat_media_visible('33333333-3333-4333-8333-333333333333','chat_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png') THEN RAISE EXCEPTION 'unattached media visible to stranger'; END IF;
  IF public.chat_media_visible('11111111-1111-4111-8111-111111111111','chat_bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb.png') THEN RAISE EXCEPTION 'unregistered legacy key visible'; END IF;
END $$;
RESET ROLE;
INSERT INTO public.private_chat_conversations VALUES ('55555555-5555-4555-8555-555555555555','11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','active');
INSERT INTO public.private_chat_conversations VALUES ('66666666-6666-4666-8666-666666666666','33333333-3333-4333-8333-333333333333','22222222-2222-4222-8222-222222222222','active');
INSERT INTO public.private_chat_messages VALUES ('77777777-7777-4777-8777-777777777777','66666666-6666-4666-8666-666666666666','33333333-3333-4333-8333-333333333333','/api/v1/content/chat/media/chat_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png');
SET ROLE moneyverse_app;
DO $$ BEGIN
  IF public.chat_media_visible('22222222-2222-4222-8222-222222222222','chat_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png') THEN RAISE EXCEPTION 'forged message unlocked media'; END IF;
END $$;
RESET ROLE;
INSERT INTO public.private_chat_messages VALUES ('88888888-8888-4888-8888-888888888888','55555555-5555-4555-8555-555555555555','11111111-1111-4111-8111-111111111111','/api/v1/content/chat/media/chat_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png');
SET ROLE moneyverse_app;
DO $$ BEGIN
  IF NOT public.chat_media_visible('22222222-2222-4222-8222-222222222222','chat_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png') THEN RAISE EXCEPTION 'legitimate peer blocked'; END IF;
  IF public.chat_media_visible('33333333-3333-4333-8333-333333333333','chat_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png') THEN RAISE EXCEPTION 'foreign member sees media'; END IF;
END $$;
RESET ROLE;
INSERT INTO public.support_threads VALUES ('99999999-9999-4999-8999-999999999999','22222222-2222-4222-8222-222222222222');
INSERT INTO public.support_messages VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab','99999999-9999-4999-8999-999999999999','11111111-1111-4111-8111-111111111111','/api/v1/content/chat/media/chat_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png');
SET ROLE moneyverse_app;
DO $$ BEGIN
  IF NOT public.chat_media_visible('44444444-4444-4444-8444-444444444444','chat_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png') THEN RAISE EXCEPTION 'support admin blocked'; END IF;
  IF public.chat_media_visible('33333333-3333-4333-8333-333333333333','chat_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png') THEN RAISE EXCEPTION 'support outsider sees media'; END IF;
END $$;
SELECT 'PASS: owner, recipient, forged sender, support admin, outsider, legacy, least privilege' AS result;
