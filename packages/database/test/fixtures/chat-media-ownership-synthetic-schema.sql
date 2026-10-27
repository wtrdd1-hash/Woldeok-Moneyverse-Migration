-- Synthetic isolated PostgreSQL fixture ONLY. Never run against shared/live DB.
CREATE ROLE moneyverse_migrator LOGIN;
CREATE ROLE moneyverse_app LOGIN;
CREATE TYPE public.user_status AS ENUM ('active','inactive');
CREATE TABLE public.users (id uuid PRIMARY KEY, status public.user_status NOT NULL DEFAULT 'active');
CREATE TABLE public.private_chat_conversations (id uuid PRIMARY KEY, participant_a_id uuid, participant_b_id uuid, state text);
CREATE TABLE public.private_chat_messages (id uuid PRIMARY KEY, conversation_id uuid, sender_id uuid, body text);
CREATE TABLE public.support_threads (id uuid PRIMARY KEY, user_id uuid);
CREATE TABLE public.support_messages (id uuid PRIMARY KEY, thread_id uuid, sender_user_id uuid, body text);
CREATE FUNCTION public.admin_current_roles(p_actor uuid) RETURNS TABLE(role text)
LANGUAGE sql STABLE AS $$ SELECT 'admin'::text WHERE p_actor = '44444444-4444-4444-8444-444444444444'::uuid $$;
ALTER TABLE public.users OWNER TO moneyverse_migrator;
ALTER TABLE public.private_chat_conversations OWNER TO moneyverse_migrator;
ALTER TABLE public.private_chat_messages OWNER TO moneyverse_migrator;
ALTER TABLE public.support_threads OWNER TO moneyverse_migrator;
ALTER TABLE public.support_messages OWNER TO moneyverse_migrator;
CREATE FUNCTION public.admin_session_touch(p_session uuid, p_actor uuid)
RETURNS TABLE(state text, expires_at timestamptz, idle_expires_at timestamptz)
LANGUAGE sql VOLATILE AS $$
  SELECT CASE WHEN p_session = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'::uuid
                   AND p_actor = '44444444-4444-4444-8444-444444444444'::uuid
              THEN 'open' ELSE 'none' END::text, NULL::timestamptz, NULL::timestamptz
$$;
ALTER FUNCTION public.admin_current_roles(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_session_touch(uuid,uuid) OWNER TO moneyverse_migrator;
GRANT USAGE ON SCHEMA public TO moneyverse_app;
GRANT CREATE ON SCHEMA public TO moneyverse_migrator;
